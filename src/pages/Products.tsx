import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Eye,
  PackageOpen,
  Truck,
  ArrowRightLeft,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { productService, Product } from "@/services/firebaseService";
import { generateProductReport } from "../lib/pdfExport";



// Extended Product interface for display purposes
interface ProductDisplay extends Product {
  display_status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const Products = () => {
  const [productsList, setProductsList] = useState<ProductDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Category management state
  const [categories, setCategories] = useState<string[]>([
    'Raw Materials',
    'Finished Goods', 
    'Components',
    'Packaging',
    'Tools',
    'Consumables',
    'Spare Parts'
  ]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Form data for StockMaster specification: Name, SKU/Code, Category, Unit of Measure, Initial stock
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    category: "",
    unit: "pieces (pcs)",
    stock: 0,
    reorder_level: 10,
    cost_price: 0,
    selling_price: 0,
    description: "",
    supplier: "",
    status: "active",
    location: "Main Warehouse"
  });

  // StockMaster categories and units
  const unitsOfMeasure = [
    'pieces',
    'kg', 
    'grams',
    'liters',
    'ml',
    'meters',
    'cm',
    'boxes',
    'cartons',
    'sets'
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const addNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const updatedCategories = [...categories, newCategoryName.trim()];
      setCategories(updatedCategories);
      
      // Set the new category as selected in the form
      setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      
      // Reset and hide the input
      setNewCategoryName("");
      setShowNewCategoryInput(false);
      toast.success(`Category "${newCategoryName.trim()}" added successfully`);
    } else if (categories.includes(newCategoryName.trim())) {
      toast.error('Category already exists');
    } else {
      toast.error('Please enter a valid category name');
    }
  };

  const handleCategorySelect = (value: string) => {
    if (value === 'add_new') {
      setShowNewCategoryInput(true);
    } else {
      setFormData(prev => ({ ...prev, category: value }));
      setShowNewCategoryInput(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const productsData = await productService.getAllProducts();
      
      // Transform Firebase data and calculate display status based on stock levels
      const transformedProducts: ProductDisplay[] = productsData.map(product => {
        let display_status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
        
        if (product.stock === 0) {
          display_status = 'Out of Stock';
        } else if (product.stock <= product.reorder_level) {
          display_status = 'Low Stock';
        }

        return {
          ...product,
          display_status
        };
      });

      setProductsList(transformedProducts);
      if (transformedProducts.length > 0) {
        toast.success(`Loaded ${transformedProducts.length} products from Firestore`);
      } else {
        toast.info('No products found - add your first product');
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      setError('Failed to load products from Firestore');
      toast.error('Failed to load products: ' + error.message);
      setProductsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required StockMaster fields
    if (!formData.name || !formData.category || !formData.unit) {
      toast.error('Please fill in all required fields: Name, Category, Unit of Measure');
      return;
    }

    try {
      setIsLoading(true);
      
      // Auto-generate SKU if not provided
      const sku = formData.sku || `${formData.category?.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      
      const productData: Omit<Product, 'id'> = {
        name: formData.name || '',
        sku,
        category: formData.category || '',
        unit: formData.unit || 'pieces',
        stock: formData.stock || 0,
        status: formData.status || 'active',
        location: formData.location || 'Main Warehouse',
        reorder_level: formData.reorder_level || 10,
        supplier: formData.supplier || '',
        cost_price: formData.cost_price || 0,
        selling_price: formData.selling_price || 0,
        description: formData.description || ''
      };

      if (editingProduct?.id) {
        // Update existing product using Firebase
        await productService.updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully in Firestore!');
      } else {
        // Create new product using Firebase
        await productService.createProduct(productData);
        toast.success('Product created successfully in Firestore!');
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      unit: "pieces",
      stock: 0,
      reorder_level: 10,
      cost_price: 0,
      selling_price: 0,
      description: "",
      supplier: "",
      status: "active",
      location: "Main Warehouse"
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully from Firestore!');
      await loadProducts(); // Reload products list
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product: ' + error.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsSubmitting(true);
      toast.info('Generating product report...');
      
      // Use filtered products if any filters are applied
      const exportData = filteredProducts.length > 0 ? filteredProducts : productsList;
      
      if (exportData.length === 0) {
        toast.error('No products to export');
        return;
      }
      
      await generateProductReport(exportData);
      toast.success('Product report downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick action handlers for direct operations
  const handleQuickReceipt = async (product: ProductDisplay) => {
    const quantity = prompt(`Add stock for ${product.name}\nCurrent: ${product.stock} ${product.unit}\nEnter quantity to receive:`);
    if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
      const quantityNum = Number(quantity);
      const supplier = prompt('Enter supplier name:') || 'Direct Receipt';
      
      try {
        const receiptData = {
          supplier: supplier,
          items: [{
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity: quantityNum,
            cost_price: product.cost_price || 0,
            location: product.location
          }],
          notes: `Quick receipt for ${product.name}`
        };

        const response = await fetch('http://localhost:5000/api/operations/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(receiptData)
        });

        const result = await response.json();
        if (response.ok && result.success) {
          toast.success(`Receipt created: +${quantityNum} ${product.unit} for ${product.name}`);
        } else {
          toast.error(result.message || 'Failed to create receipt');
        }
      } catch (error: any) {
        toast.error(`Error creating receipt: ${error.message}`);
      }
    } else if (quantity !== null) {
      toast.error('Please enter a valid positive quantity');
    }
  };

  const handleQuickDelivery = async (product: ProductDisplay) => {
    const quantity = prompt(`Create delivery for ${product.name}\nCurrent: ${product.stock} ${product.unit}\nEnter quantity to deliver:`);
    if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
      const quantityNum = Number(quantity);
      if (quantityNum > product.stock) {
        toast.error(`Cannot deliver ${quantityNum} ${product.unit}. Only ${product.stock} ${product.unit} available.`);
        return;
      }
      
      const customer = prompt('Enter customer name:') || 'Direct Delivery';
      
      try {
        const deliveryData = {
          customer: customer,
          items: [{
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity: quantityNum,
            location: product.location
          }],
          notes: `Quick delivery for ${product.name}`
        };

        const response = await fetch('http://localhost:5000/api/operations/deliveries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deliveryData)
        });

        const result = await response.json();
        if (response.ok && result.success) {
          toast.success(`Delivery created: -${quantityNum} ${product.unit} for ${product.name}`);
        } else {
          toast.error(result.message || 'Failed to create delivery');
        }
      } catch (error: any) {
        toast.error(`Error creating delivery: ${error.message}`);
      }
    } else if (quantity !== null) {
      toast.error('Please enter a valid quantity');
    }
  };

  const handleQuickAdjustment = async (product: ProductDisplay) => {
    const adjustment = prompt(`Current stock: ${product.stock} ${product.unit}\nEnter adjustment (+/- quantity):`);
    if (adjustment && !isNaN(Number(adjustment))) {
      const adjustmentNum = Number(adjustment);
      const newStock = product.stock + adjustmentNum;
      if (newStock < 0) {
        toast.error('Adjustment would result in negative stock');
        return;
      }
      
      const reason = prompt('Enter reason for adjustment:') || 'Manual adjustment';
      
      try {
        const adjustmentData = {
          product_id: product.id,
          product_name: product.name,
          quantity: adjustmentNum,
          reason: reason,
          location: product.location,
          notes: `Quick adjustment for ${product.name}`
        };

        const response = await fetch('http://localhost:5000/api/operations/adjustments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adjustmentData)
        });

        const result = await response.json();
        if (response.ok && result.success) {
          toast.success(`Adjustment created: ${adjustmentNum > 0 ? '+' : ''}${adjustmentNum} ${product.unit} for ${product.name}`);
          // Optionally refresh products list
          // loadProducts();
        } else {
          toast.error(result.message || 'Failed to create adjustment');
        }
      } catch (error: any) {
        toast.error(`Error creating adjustment: ${error.message}`);
      }
    } else if (adjustment !== null) {
      toast.error('Please enter a valid adjustment (+/- number)');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock': return <TrendingUp className="h-4 w-4" />;
      case 'Low Stock': return <AlertCircle className="h-4 w-4" />;
      case 'Out of Stock': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  // Filter products based on search and filters
  const filteredProducts = productsList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.display_status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your inventory products following StockMaster specification</p>
          {error && (
            <p className="text-yellow-600 text-sm mt-1">⚠️ {error}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleExportPDF} 
            variant="outline" 
            disabled={isSubmitting || productsList.length === 0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Product Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              Enter product details following StockMaster specification: Name, SKU/Code, Category, Unit of Measure, Initial stock
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Name - Required */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* SKU/Code - Auto-generated if empty */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU/Code</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>

              {/* Category - Required with Add New Option */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleCategorySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or add category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="add_new" className="border-t mt-2 pt-2">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Category
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* New Category Input */}
                {showNewCategoryInput && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addNewCategory();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={addNewCategory}
                      size="sm"
                      disabled={!newCategoryName.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName("");
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Unit of Measure - Required */}
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measure *</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => setFormData({...formData, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsOfMeasure.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Stock - Optional */}
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              {/* Reorder Level */}
              <div className="space-y-2">
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  min="0"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({...formData, reorder_level: parseInt(e.target.value) || 10})}
                  placeholder="10"
                />
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>

              {/* Selling Price */}
              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price</Label>
                <Input
                  id="selling_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingProduct ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU/Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {searchQuery ? (
                        <>No products found matching "{searchQuery}"</>
                      ) : (
                        <>No products found. Add your first product to get started.</>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            {product.supplier && (
                              <div className="text-xs text-muted-foreground">by {product.supplier}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{product.sku}</code>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{product.stock}</span>
                          {product.stock <= product.reorder_level && (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(product.display_status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(product.display_status)}
                            <span>{product.display_status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>${product.selling_price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center space-x-1 justify-end">
                          {/* Quick Operations Buttons */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickReceipt(product)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Add Stock (Receipt)"
                          >
                            <PackageOpen className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickDelivery(product)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="Mark Delivered"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickAdjustment(product)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            title="Stock Adjustment"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          
                          {/* Edit/Delete Actions */}
                          <div className="border-l pl-1 ml-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => product.id && handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{productsList.length}</div>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {productsList.filter(p => p.display_status === "In Stock").length}
            </div>
            <p className="text-xs text-muted-foreground">In Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {productsList.filter(p => p.display_status === "Low Stock").length}
            </div>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {productsList.filter(p => p.display_status === "Out of Stock").length}
            </div>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Products;