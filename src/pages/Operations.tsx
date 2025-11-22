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
import { mockFirestore } from "@/lib/mockFirebase";
// import { db } from "@/lib/firebase";
// import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

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

interface Adjustment {
  id: string;
  adjustment_id: string;
  product_name: string;
  quantity: number;
  reason: string;
  status: string;
  created_at: string;
}

interface Delivery {
  id: string;
  delivery_id: string;
  customer: string;
  product_id: string;
  product_name: string;
  quantity: number;
  to_location: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface Transfer {
  id: string;
  transfer_id: string;
  product_id: string;
  product_name: string;
  from_location: string;
  to_location: string;
  quantity: number;
  status: string;
  notes?: string;
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
  
  const [adjustmentForm, setAdjustmentForm] = useState({
    product_id: '',
    product_name: '',
    quantity: 0,
    reason: '',
    location: '',
    notes: ''
  });

  const [deliveryForm, setDeliveryForm] = useState({
    customer: '',
    product_id: '',
    product_name: '',
    to_location: '',
    quantity: 0,
    notes: ''
  });

  const [transferForm, setTransferForm] = useState({
    product_id: '',
    product_name: '',
    from_location: '',
    to_location: '',
    quantity: 0,
    notes: ''
  });

  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [adjustmentReasons, setAdjustmentReasons] = useState<string[]>([]);

  // Load dynamic configuration data
  useEffect(() => {
    loadUserData();
    loadConfigData();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const loadConfigData = async () => {
    // In a real application, this would come from Firebase config collection
    // For now, we'll use enhanced static data that could come from user's organization settings
    setLocations([
      'Main Warehouse',
      'Secondary Warehouse',
      'Production Floor',
      'Shipping Dock', 
      'Receiving Area',
      'Storage Room A',
      'Storage Room B',
      'Quality Control Area',
      'Cold Storage',
      'Hazmat Storage'
    ]);

    setAdjustmentReasons([
      'Damaged goods',
      'Expired products', 
      'Quality control failure',
      'Count correction',
      'Return to supplier',
      'Customer return',
      'Theft/Loss',
      'Transfer to disposal',
      'Production defect',
      'Inventory reconciliation',
      'Other'
    ]);
  };

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
    try {
      const result = await mockFirestore.collection('receipts').orderBy('created_at', 'desc').get();
      const receiptData = result.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Receipt[];
      setReceipts(receiptData);
    } catch (error: any) {
      console.error('Error loading receipts:', error);
      toast.error('Failed to load receipts from Firebase');
    }
  };

  const loadDeliveries = async () => {
    try {
      const result = await mockFirestore.collection('deliveries').orderBy('created_at', 'desc').get();
      const deliveryData = result.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Delivery[];
      setDeliveries(deliveryData);
    } catch (error: any) {
      console.error('Error loading deliveries:', error);
      toast.error('Failed to load deliveries from Firebase');
    }
  };

  const loadTransfers = async () => {
    try {
      const result = await mockFirestore.collection('transfers').orderBy('created_at', 'desc').get();
      const transferData = result.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transfer[];
      setTransfers(transferData);
    } catch (error: any) {
      console.error('Error loading transfers:', error);
      toast.error('Failed to load transfers from Firebase');
    }
  };

  const loadAdjustments = async () => {
    try {
      const result = await mockFirestore.collection('adjustments').orderBy('created_at', 'desc').get();
      const adjustmentData = result.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Adjustment[];
      setAdjustments(adjustmentData);
    } catch (error: any) {
      console.error('Error loading adjustments:', error);
      toast.error('Failed to load adjustments from Firebase');
    }
  };

  const loadProducts = async () => {
    try {
      const result = await mockFirestore.collection('products').get();
      const productData = result.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productData);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products from Firebase');
    }
  };

  const createReceipt = async () => {
    try {
      if (!receiptForm.supplier || receiptForm.items.length === 0) {
        toast.error('Please fill in all required fields and add at least one item');
        return;
      }

      const receiptData = {
        receipt_id: `REC-${Date.now()}`,
        supplier: receiptForm.supplier,
        items: receiptForm.items,
        total_items: receiptForm.items.length,
        total_value: receiptForm.items.reduce((sum, item) => sum + (item.cost_price || 0) * item.quantity, 0),
        status: 'pending',
        notes: receiptForm.notes,
        created_at: mockFirestore.serverTimestamp()
      };

      await mockFirestore.collection('receipts').add(receiptData);
      
      // Create movement history entry
      const movementData = {
        product_name: receiptForm.items.map(i => i.product_name).join(', '),
        sku: receiptForm.items.map(i => i.sku).join(', '),
        type: 'receipt',
        quantity: receiptForm.items.reduce((sum, item) => sum + item.quantity, 0),
        from_location: null,
        to_location: receiptForm.items[0]?.location || locations[0] || 'Default Location',
        reference: receiptData.receipt_id,
        notes: `Receipt from ${receiptForm.supplier}`,
        user_name: currentUser?.name || 'Unknown User',
        user_id: currentUser?.id || null,
        user_role: currentUser?.role || 'unknown',
        timestamp: mockFirestore.serverTimestamp()
      };
      
      await mockFirestore.collection('movements').add(movementData);
      
      toast.success('Receipt created successfully in Firebase!');
      setShowReceiptDialog(false);
      setReceiptForm({ supplier: '', notes: '', items: [] });
      await loadReceipts();
    } catch (error: any) {
      console.error('Error creating receipt:', error);
      toast.error(`Error creating receipt: ${error.message}`);
    }
  };

  const createAdjustment = async () => {
    try {
      if (!adjustmentForm.product_id || !adjustmentForm.reason || !adjustmentForm.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      const adjustmentData = {
        adjustment_id: `ADJ-${Date.now()}`,
        product_id: adjustmentForm.product_id,
        product_name: adjustmentForm.product_name,
        quantity: adjustmentForm.quantity,
        reason: adjustmentForm.reason,
        location: adjustmentForm.location,
        notes: adjustmentForm.notes,
        status: 'pending',
        created_at: mockFirestore.serverTimestamp()
      };

      await mockFirestore.collection('adjustments').add(adjustmentData);
      
      // Create movement history entry
      const movementData = {
        product_name: adjustmentForm.product_name,
        sku: 'SKU-UNKNOWN',
        type: 'adjustment',
        quantity: adjustmentForm.quantity,
        from_location: adjustmentForm.location,
        to_location: adjustmentForm.location,
        reference: adjustmentData.adjustment_id,
        notes: `Adjustment: ${adjustmentForm.reason}`,
        user_name: currentUser?.name || 'Unknown User',
        user_id: currentUser?.id || null,
        user_role: currentUser?.role || 'unknown',
        timestamp: mockFirestore.serverTimestamp()
      };
      
      await mockFirestore.collection('movements').add(movementData);
      
      toast.success('Adjustment created successfully in Firebase!');
      setShowAdjustmentDialog(false);
      setAdjustmentForm({ product_id: '', product_name: '', quantity: 0, reason: '', location: '', notes: '' });
      await loadAdjustments();
    } catch (error: any) {
      console.error('Error creating adjustment:', error);
      toast.error(`Error creating adjustment: ${error.message}`);
    }
  };

  const createDelivery = async () => {
    try {
      if (!deliveryForm.customer || !deliveryForm.product_id || !deliveryForm.to_location || deliveryForm.quantity <= 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      const deliveryData = {
        delivery_id: `DEL-${Date.now()}`,
        customer: deliveryForm.customer,
        product_id: deliveryForm.product_id,
        product_name: deliveryForm.product_name,
        quantity: deliveryForm.quantity,
        to_location: deliveryForm.to_location,
        status: 'pending',
        notes: deliveryForm.notes,
        created_at: mockFirestore.serverTimestamp()
      };

      await mockFirestore.collection('deliveries').add(deliveryData);
      
      // Create movement history entry
      const movementData = {
        product_name: deliveryForm.product_name,
        sku: 'SKU-UNKNOWN',
        type: 'delivery',
        quantity: -deliveryForm.quantity, // Negative for outgoing
        from_location: currentUser?.location || 'Default Warehouse',
        to_location: deliveryForm.to_location,
        reference: deliveryData.delivery_id,
        notes: `Delivery to ${deliveryForm.customer}`,
        user_name: currentUser?.name || 'Unknown User',
        user_id: currentUser?.id || null,
        user_role: currentUser?.role || 'unknown',
        timestamp: mockFirestore.serverTimestamp()
      };
      
      await mockFirestore.collection('movements').add(movementData);
      
      toast.success('Delivery created successfully in Firebase!');
      setShowDeliveryDialog(false);
      setDeliveryForm({ customer: '', product_id: '', product_name: '', to_location: '', quantity: 0, notes: '' });
      await loadDeliveries();
    } catch (error: any) {
      console.error('Error creating delivery:', error);
      toast.error(`Error creating delivery: ${error.message}`);
    }
  };

  const createTransfer = async () => {
    try {
      if (!transferForm.product_id || !transferForm.from_location || !transferForm.to_location) {
        toast.error('Please fill in all required fields');
        return;
      }

      const transferData = {
        transfer_id: `TRF-${Date.now()}`,
        product_id: transferForm.product_id,
        product_name: transferForm.product_name,
        from_location: transferForm.from_location,
        to_location: transferForm.to_location,
        quantity: transferForm.quantity,
        notes: transferForm.notes,
        status: 'pending',
        created_at: mockFirestore.serverTimestamp()
      };

      await mockFirestore.collection('transfers').add(transferData);
      
      // Create movement history entry
      const movementData = {
        product_name: transferForm.product_name,
        sku: 'SKU-UNKNOWN',
        type: 'transfer',
        quantity: transferForm.quantity,
        from_location: transferForm.from_location,
        to_location: transferForm.to_location,
        reference: transferData.transfer_id,
        notes: `Transfer from ${transferForm.from_location} to ${transferForm.to_location}`,
        user_name: 'Current User',
        timestamp: mockFirestore.serverTimestamp()
      };
      
      await mockFirestore.collection('movements').add(movementData);
      
      toast.success('Transfer created successfully in Firebase!');
      setShowTransferDialog(false);
      setTransferForm({ product_id: '', product_name: '', from_location: '', to_location: '', quantity: 0, notes: '' });
      await loadTransfers();
    } catch (error: any) {
      console.error('Error creating transfer:', error);
      toast.error(`Error creating transfer: ${error.message}`);
    }
  };

  const addItemToForm = () => {
    const newItem: OperationItem = {
      product_id: '',
      product_name: '',
      sku: '',
      quantity: 1,
      cost_price: 0,
      location: locations[0]
    };
    
    setReceiptForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations</h1>
          <p className="text-muted-foreground">
            Manage warehouse operations - receipts, deliveries, transfers, and adjustments
          </p>
        </div>
      </div>

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
                        <Button type="button" variant="outline" onClick={addItemToForm}>
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

        <TabsContent value="deliveries" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Delivery Operations
              </CardTitle>
              <CardDescription>
                Process outgoing shipments to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Delivery operations coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                Transfer Operations
              </CardTitle>
              <CardDescription>
                Move inventory between locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Transfer operations coming soon...</p>
              </div>
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
                    Process outbound deliveries to customers and locations
                  </CardDescription>
                </div>
                <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Delivery
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Delivery</DialogTitle>
                      <DialogDescription>
                        Process outbound shipment to customers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer">Customer/Destination *</Label>
                          <Input
                            id="customer"
                            value={deliveryForm.customer}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, customer: e.target.value }))}
                            placeholder="Enter customer name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery-location">Delivery Location *</Label>
                          <Select
                            value={deliveryForm.to_location}
                            onValueChange={(value) => setDeliveryForm(prev => ({ ...prev, to_location: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delivery-product">Product *</Label>
                          <Select
                            value={deliveryForm.product_id}
                            onValueChange={(value) => {
                              const selectedProduct = products.find(p => p.id === value);
                              setDeliveryForm(prev => ({ 
                                ...prev, 
                                product_id: value,
                                product_name: selectedProduct?.name || ''
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
                          <Label htmlFor="delivery-quantity">Quantity *</Label>
                          <Input
                            id="delivery-quantity"
                            type="number"
                            value={deliveryForm.quantity}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                            placeholder="Delivery quantity"
                            min="1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="delivery-notes">Delivery Notes</Label>
                        <Textarea
                          id="delivery-notes"
                          value={deliveryForm.notes}
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Special delivery instructions or notes"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={createDelivery}
                          disabled={!deliveryForm.customer || !deliveryForm.product_id || !deliveryForm.to_location || deliveryForm.quantity <= 0}
                        >
                          Create Delivery
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
                  Loading deliveries...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Delivery ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No deliveries found. Click "New Delivery" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      deliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.delivery_id}</TableCell>
                          <TableCell>{delivery.customer}</TableCell>
                          <TableCell>{delivery.product_name}</TableCell>
                          <TableCell>{delivery.quantity}</TableCell>
                          <TableCell>{delivery.to_location}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(delivery.status) as any}>
                              {delivery.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(delivery.created_at).toLocaleDateString()}</TableCell>
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
                    Move inventory between warehouse locations
                  </CardDescription>
                </div>
                <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Transfer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Transfer</DialogTitle>
                      <DialogDescription>
                        Transfer inventory between warehouse locations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="transfer-product">Product *</Label>
                        <Select
                          value={transferForm.product_id}
                          onValueChange={(value) => {
                            const selectedProduct = products.find(p => p.id === value);
                            setTransferForm(prev => ({ 
                              ...prev, 
                              product_id: value,
                              product_name: selectedProduct?.name || ''
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product to transfer" />
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
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="from-location">From Location *</Label>
                          <Select
                            value={transferForm.from_location}
                            onValueChange={(value) => setTransferForm(prev => ({ ...prev, from_location: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="From" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="to-location">To Location *</Label>
                          <Select
                            value={transferForm.to_location}
                            onValueChange={(value) => setTransferForm(prev => ({ ...prev, to_location: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="To" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.filter(loc => loc !== transferForm.from_location).map((location) => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="transfer-quantity">Quantity *</Label>
                          <Input
                            id="transfer-quantity"
                            type="number"
                            value={transferForm.quantity}
                            onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                            placeholder="Quantity"
                            min="1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="transfer-notes">Transfer Notes</Label>
                        <Textarea
                          id="transfer-notes"
                          value={transferForm.notes}
                          onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Reason for transfer or additional notes"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={createTransfer}
                          disabled={!transferForm.product_id || !transferForm.from_location || !transferForm.to_location || transferForm.quantity <= 0}
                        >
                          Create Transfer
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
                  Loading transfers...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>From Location</TableHead>
                      <TableHead>To Location</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No transfers found. Click "New Transfer" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-medium">{transfer.transfer_id}</TableCell>
                          <TableCell>{transfer.product_name}</TableCell>
                          <TableCell>{transfer.from_location}</TableCell>
                          <TableCell>{transfer.to_location}</TableCell>
                          <TableCell>{transfer.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(transfer.status) as any}>
                              {transfer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(transfer.created_at).toLocaleDateString()}</TableCell>
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