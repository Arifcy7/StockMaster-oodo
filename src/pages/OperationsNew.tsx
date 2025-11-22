import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  PackageOpen, 
  Truck, 
  ArrowRightLeft, 
  FileText, 
  Plus,
  Loader2,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface OperationItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  cost_price?: number;
  location: string;
}

interface Receipt {
  id: string;
  receipt_id: string;
  supplier: string;
  items: OperationItem[];
  total_items: number;
  total_value: number;
  status: string;
  created_at: string;
}

interface Delivery {
  id: string;
  delivery_id: string;
  customer: string;
  items: OperationItem[];
  status: string;
  created_at: string;
}

interface Transfer {
  id: string;
  transfer_id: string;
  from_location: string;
  to_location: string;
  items: OperationItem[];
  status: string;
  created_at: string;
}

interface Adjustment {
  id: string;
  adjustment_id: string;
  product_name: string;
  quantity: number;
  reason: string;
  status: string;
  created_at: string;
}

const Operations = () => {
  const [activeTab, setActiveTab] = useState<string>('receipts');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [receiptForm, setReceiptForm] = useState({
    supplier: '',
    notes: '',
    items: [] as OperationItem[]
  });
  
  const [deliveryForm, setDeliveryForm] = useState({
    customer: '',
    notes: '',
    items: [] as OperationItem[]
  });
  
  const [transferForm, setTransferForm] = useState({
    from_location: '',
    to_location: '',
    notes: '',
    items: [] as OperationItem[]
  });
  
  const [adjustmentForm, setAdjustmentForm] = useState({
    product_id: '',
    product_name: '',
    quantity: 0,
    reason: '',
    location: '',
    notes: ''
  });

  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);

  const locations = [
    'Warehouse A',
    'Warehouse B',
    'Main Store',
    'Storage Room',
    'Production Floor'
  ];

  const adjustmentReasons = [
    'Damaged goods',
    'Expired products',
    'Quality control',
    'Count correction',
    'Return to supplier',
    'Theft/Loss',
    'Other'
  ];

  useEffect(() => {
    loadData();
    loadProducts();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'receipts':
          await loadReceipts();
          break;
        case 'deliveries':
          await loadDeliveries();
          break;
        case 'transfers':
          await loadTransfers();
          break;
        case 'adjustments':
          await loadAdjustments();
          break;
      }
    } catch (error: any) {
      toast.error(`Failed to load ${activeTab}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReceipts = async () => {
    const response = await fetch('http://localhost:5000/api/operations/receipts');
    const data = await response.json();
    setReceipts(data.receipts || []);
  };

  const loadDeliveries = async () => {
    const response = await fetch('http://localhost:5000/api/operations/deliveries');
    const data = await response.json();
    setDeliveries(data.deliveries || []);
  };

  const loadTransfers = async () => {
    const response = await fetch('http://localhost:5000/api/operations/transfers');
    const data = await response.json();
    setTransfers(data.transfers || []);
  };

  const loadAdjustments = async () => {
    const response = await fetch('http://localhost:5000/api/operations/adjustments');
    const data = await response.json();
    setAdjustments(data.adjustments || []);
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const createReceipt = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operations/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptForm)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Receipt created successfully');
        setShowReceiptDialog(false);
        setReceiptForm({ supplier: '', notes: '', items: [] });
        await loadReceipts();
      } else {
        toast.error(result.message || 'Failed to create receipt');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const createDelivery = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operations/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryForm)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Delivery created successfully');
        setShowDeliveryDialog(false);
        setDeliveryForm({ customer: '', notes: '', items: [] });
        await loadDeliveries();
      } else {
        toast.error(result.message || 'Failed to create delivery');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const createTransfer = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operations/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Transfer created successfully');
        setShowTransferDialog(false);
        setTransferForm({ from_location: '', to_location: '', notes: '', items: [] });
        await loadTransfers();
      } else {
        toast.error(result.message || 'Failed to create transfer');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const createAdjustment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operations/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentForm)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Adjustment created successfully');
        setShowAdjustmentDialog(false);
        setAdjustmentForm({ product_id: '', product_name: '', quantity: 0, reason: '', location: '', notes: '' });
        await loadAdjustments();
      } else {
        toast.error(result.message || 'Failed to create adjustment');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const addItemToForm = (type: 'receipt' | 'delivery' | 'transfer') => {
    const newItem: OperationItem = {
      product_id: '',
      product_name: '',
      sku: '',
      quantity: 1,
      cost_price: 0,
      location: locations[0]
    };
    
    switch (type) {
      case 'receipt':
        setReceiptForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
        break;
      case 'delivery':
        setDeliveryForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
        break;
      case 'transfer':
        setTransferForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
        break;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done': case 'completed': return 'default';
      case 'waiting': case 'pending': return 'secondary';
      case 'ready': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations</h1>
          <p className="text-muted-foreground">
            Manage warehouse operations - receipts, deliveries, transfers, and adjustments
          </p>
        </div>
      </div>

      {/* Direct Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="adjustments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Adjustments
          </TabsTrigger>
        </TabsList>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PackageOpen className="h-5 w-5 text-green-600" />
                    Receipt Operations
                  </CardTitle>
                  <CardDescription>
                    Process incoming stock from suppliers and vendors
                  </CardDescription>
                </div>
                <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Receipt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create New Receipt</DialogTitle>
                      <DialogDescription>
                        Record incoming inventory from suppliers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="supplier">Supplier Name *</Label>
                          <Input
                            id="supplier"
                            value={receiptForm.supplier}
                            onChange={(e) => setReceiptForm(prev => ({ ...prev, supplier: e.target.value }))}
                            placeholder="Enter supplier name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="receipt-notes">Notes</Label>
                          <Input
                            id="receipt-notes"
                            value={receiptForm.notes}
                            onChange={(e) => setReceiptForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Items</Label>
                        <Button type="button" variant="outline" onClick={() => addItemToForm('receipt')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      {receiptForm.items.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {receiptForm.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-2 items-center">
                              <Select
                                value={item.product_id}
                                onValueChange={(value) => {
                                  const product = products.find(p => p.id === value);
                                  const updatedItems = [...receiptForm.items];
                                  updatedItems[index] = {
                                    ...item,
                                    product_id: value,
                                    product_name: product?.name || '',
                                    sku: product?.sku || ''
                                  };
                                  setReceiptForm(prev => ({ ...prev, items: updatedItems }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} ({product.sku})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updatedItems = [...receiptForm.items];
                                  updatedItems[index].quantity = parseInt(e.target.value) || 0;
                                  setReceiptForm(prev => ({ ...prev, items: updatedItems }));
                                }}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Cost"
                                value={item.cost_price}
                                onChange={(e) => {
                                  const updatedItems = [...receiptForm.items];
                                  updatedItems[index].cost_price = parseFloat(e.target.value) || 0;
                                  setReceiptForm(prev => ({ ...prev, items: updatedItems }));
                                }}
                              />
                              <Select
                                value={item.location}
                                onValueChange={(value) => {
                                  const updatedItems = [...receiptForm.items];
                                  updatedItems[index].location = value;
                                  setReceiptForm(prev => ({ ...prev, items: updatedItems }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((loc) => (
                                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedItems = receiptForm.items.filter((_, i) => i !== index);
                                  setReceiptForm(prev => ({ ...prev, items: updatedItems }));
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={createReceipt}
                          disabled={!receiptForm.supplier || receiptForm.items.length === 0}
                        >
                          Create Receipt
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading receipts...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No receipts found. Click "New Receipt" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">{receipt.receipt_id}</TableCell>
                          <TableCell>{receipt.supplier}</TableCell>
                          <TableCell>{receipt.total_items} items</TableCell>
                          <TableCell>${receipt.total_value.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(receipt.status) as any}>
                              {receipt.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(receipt.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for other tabs... */}
        <TabsContent value="deliveries" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Delivery Operations
                  </CardTitle>
                  <CardDescription>
                    Process outgoing shipments to customers
                  </CardDescription>
                </div>
                <Button onClick={() => setShowDeliveryDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Delivery
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading deliveries...
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Delivery operations coming soon...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                    Transfer Operations
                  </CardTitle>
                  <CardDescription>
                    Move inventory between locations
                  </CardDescription>
                </div>
                <Button onClick={() => setShowTransferDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transfer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading transfers...
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Transfer operations coming soon...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Adjustment Operations
                  </CardTitle>
                  <CardDescription>
                    Correct stock levels and record discrepancies
                  </CardDescription>
                </div>
                <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Adjustment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Stock Adjustment</DialogTitle>
                      <DialogDescription>
                        Adjust inventory levels and record the reason
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adj-product">Product *</Label>
                          <Select
                            value={adjustmentForm.product_id}
                            onValueChange={(value) => {
                              const product = products.find(p => p.id === value);
                              setAdjustmentForm(prev => ({
                                ...prev,
                                product_id: value,
                                product_name: product?.name || ''
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="adj-quantity">Adjustment Quantity *</Label>
                          <Input
                            id="adj-quantity"
                            type="number"
                            value={adjustmentForm.quantity}
                            onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                            placeholder="+/- quantity"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adj-reason">Reason *</Label>
                          <Select
                            value={adjustmentForm.reason}
                            onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, reason: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {adjustmentReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="adj-location">Location *</Label>
                          <Select
                            value={adjustmentForm.location}
                            onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, location: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="adj-notes">Notes</Label>
                        <Textarea
                          id="adj-notes"
                          value={adjustmentForm.notes}
                          onChange={(e) => setAdjustmentForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes about the adjustment"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={createAdjustment}
                          disabled={!adjustmentForm.product_id || !adjustmentForm.reason || !adjustmentForm.location}
                        >
                          Create Adjustment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading adjustments...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adjustment ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No adjustments found. Click "New Adjustment" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      adjustments.map((adjustment) => (
                        <TableRow key={adjustment.id}>
                          <TableCell className="font-medium">{adjustment.adjustment_id}</TableCell>
                          <TableCell>{adjustment.product_name}</TableCell>
                          <TableCell className={adjustment.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                            {adjustment.quantity > 0 ? '+' : ''}{adjustment.quantity}
                          </TableCell>
                          <TableCell>{adjustment.reason}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(adjustment.status) as any}>
                              {adjustment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(adjustment.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Operations;