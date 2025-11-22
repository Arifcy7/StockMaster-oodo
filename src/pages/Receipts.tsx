import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check,
  X,
  Loader2,
  ShoppingCart,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { operations, products, Operation, Product } from "@/services/firebase";

interface ReceiptItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Receipt extends Omit<Operation, 'type'> {
  type: 'receipt';
  supplier: string;
  receipt_items: ReceiptItem[];
  total_items: number;
  total_value: number;
  location: string;
}

const Receipts = () => {
  const [receiptsList, setReceiptsList] = useState<Receipt[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  
  // Form data for StockMaster Receipt workflow
  const [formData, setFormData] = useState({
    supplier: "",
    location: "Main Warehouse",
    description: "",
    status: "Draft" as "Draft" | "Waiting" | "Ready" | "Done" | "Canceled"
  });

  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 0,
    unit_price: 0
  });

  // Status types and locations
  const statusTypes = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
  const locations = ['Main Warehouse', 'Secondary Warehouse', 'Production Floor', 'Receiving Dock'];
  const suppliers = ['ABC Suppliers', 'XYZ Manufacturing', 'Global Parts Ltd', 'Local Distributors'];

  useEffect(() => {
    loadReceipts();
    loadProducts();
  }, []);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      const operationsData = await operations.getAll();
      
      // Filter only receipt operations
      const receipts = operationsData
        .filter(op => op.type === 'receipt')
        .map(op => ({
          ...op,
          type: 'receipt' as const,
          supplier: op.supplier || 'Unknown Supplier',
          receipt_items: [],
          total_items: op.items_count || 0,
          total_value: op.total_value || 0,
          location: op.from_location || 'Main Warehouse'
        }));

      setReceiptsList(receipts);
      toast.success(`Loaded ${receipts.length} receipts`);
    } catch (error: any) {
      console.error('Failed to load receipts:', error);
      toast.error('Failed to load receipts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await products.getAll();
      setProductsList(productsData);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products for receipt creation');
    }
  };

  const addItemToReceipt = () => {
    if (!newItem.product_id || newItem.quantity <= 0) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }

    const selectedProduct = productsList.find(p => p.id === newItem.product_id);
    if (!selectedProduct) {
      toast.error('Selected product not found');
      return;
    }

    const item: ReceiptItem = {
      product_id: newItem.product_id,
      product_name: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      total_price: newItem.quantity * newItem.unit_price
    };

    setReceiptItems([...receiptItems, item]);
    setNewItem({ product_id: "", quantity: 0, unit_price: 0 });
    toast.success(`Added ${selectedProduct.name} to receipt`);
  };

  const removeItemFromReceipt = (index: number) => {
    setReceiptItems(receiptItems.filter((_, i) => i !== index));
    toast.success('Item removed from receipt');
  };

  const calculateTotals = () => {
    const totalItems = receiptItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = receiptItems.reduce((sum, item) => sum + item.total_price, 0);
    return { totalItems, totalValue };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier || receiptItems.length === 0) {
      toast.error('Please select a supplier and add at least one item');
      return;
    }

    try {
      setIsLoading(true);
      
      const { totalItems, totalValue } = calculateTotals();
      
      const receiptData: Omit<Receipt, 'id'> = {
        type: 'receipt',
        description: formData.description || `Receipt from ${formData.supplier}`,
        status: formData.status,
        supplier: formData.supplier,
        from_location: formData.location,
        items_count: totalItems,
        total_value: totalValue,
        receipt_items: receiptItems,
        total_items: totalItems,
        location: formData.location
      };

      if (editingReceipt?.id) {
        await operations.update(editingReceipt.id, receiptData);
        toast.success('Receipt updated successfully');
      } else {
        await operations.create(receiptData);
        toast.success('Receipt created successfully');
      }

      // If status is "Done", automatically update stock levels
      if (formData.status === "Done") {
        await updateStockLevels();
      }

      setIsDialogOpen(false);
      setEditingReceipt(null);
      resetForm();
      await loadReceipts();
    } catch (error: any) {
      console.error('Failed to save receipt:', error);
      toast.error('Failed to save receipt: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStockLevels = async () => {
    try {
      for (const item of receiptItems) {
        const product = productsList.find(p => p.id === item.product_id);
        if (product) {
          const updatedStock = (product.stock || 0) + item.quantity;
          await products.update(item.product_id, { 
            ...product,
            stock: updatedStock 
          });
        }
      }
      toast.success('Stock levels updated automatically');
    } catch (error: any) {
      console.error('Failed to update stock levels:', error);
      toast.error('Receipt saved but failed to update stock levels');
    }
  };

  const validateReceipt = async (receiptId: string) => {
    try {
      await operations.update(receiptId, { status: 'Done' });
      
      // Update stock levels for this receipt
      const receipt = receiptsList.find(r => r.id === receiptId);
      if (receipt && receipt.receipt_items) {
        for (const item of receipt.receipt_items) {
          const product = productsList.find(p => p.id === item.product_id);
          if (product) {
            const updatedStock = (product.stock || 0) + item.quantity;
            await products.update(item.product_id, { 
              ...product,
              stock: updatedStock 
            });
          }
        }
      }
      
      toast.success('Receipt validated and stock updated');
      await loadReceipts();
    } catch (error: any) {
      console.error('Failed to validate receipt:', error);
      toast.error('Failed to validate receipt: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier: "",
      location: "Main Warehouse", 
      description: "",
      status: "Draft"
    });
    setReceiptItems([]);
    setNewItem({ product_id: "", quantity: 0, unit_price: 0 });
  };

  const handleEdit = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setFormData({
      supplier: receipt.supplier,
      location: receipt.location,
      description: receipt.description || "",
      status: receipt.status as any
    });
    setReceiptItems(receipt.receipt_items || []);
    setIsDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Waiting': return 'bg-yellow-100 text-yellow-800';
      case 'Ready': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter receipts
  const filteredReceipts = receiptsList.filter(receipt => {
    const matchesSearch = receipt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         receipt.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading receipts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts (Incoming Stock)</h1>
          <p className="text-muted-foreground">StockMaster Receipt Workflow: Create → Add supplier & products → Input quantities → Validate → Auto stock increase</p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </div>

      {/* Receipt Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{editingReceipt ? 'Edit Receipt' : 'Create New Receipt'}</DialogTitle>
            <DialogDescription>
              Follow StockMaster receipt workflow: Add supplier & products → Input quantities → Validate
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Receipt Header */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select 
                  value={formData.supplier} 
                  onValueChange={(value) => setFormData({...formData, supplier: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select 
                  value={formData.location} 
                  onValueChange={(value) => setFormData({...formData, location: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTypes.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Items Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add Products to Receipt</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select 
                    value={newItem.product_id} 
                    onValueChange={(value) => setNewItem({...newItem, product_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {productsList.map((product) => (
                        <SelectItem key={product.id} value={product.id || ""}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value) || 0})}
                    placeholder="Enter price"
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <Button type="button" onClick={addItemToReceipt}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Receipt Items Table */}
              {receiptItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receiptItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell><code>{item.sku}</code></TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItemFromReceipt(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Totals */}
              {receiptItems.length > 0 && (
                <div className="flex justify-end space-x-4 text-sm font-medium">
                  <span>Total Items: {calculateTotals().totalItems}</span>
                  <span>Total Value: ${calculateTotals().totalValue.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingReceipt(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingReceipt ? 'Update Receipt' : 'Create Receipt'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusTypes.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {searchQuery ? (
                      <>No receipts found matching "{searchQuery}"</>
                    ) : (
                      <>No receipts found. Create your first receipt to get started.</>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <code className="text-xs">REC-{receipt.id?.substring(0, 8)}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {receipt.supplier}
                      </div>
                    </TableCell>
                    <TableCell>{receipt.location}</TableCell>
                    <TableCell>{receipt.total_items || 0}</TableCell>
                    <TableCell>${(receipt.total_value || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(receipt.status)}>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(receipt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {receipt.status !== 'Done' && receipt.status !== 'Canceled' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => receipt.id && validateReceipt(receipt.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{receiptsList.length}</div>
            <p className="text-xs text-muted-foreground">Total Receipts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {receiptsList.filter(r => ['Draft', 'Waiting', 'Ready'].includes(r.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Receipts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {receiptsList.filter(r => r.status === 'Done').length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${receiptsList.reduce((sum, r) => sum + (r.total_value || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Receipts;