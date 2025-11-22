import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with MongoDB data via Flask API
  const products = [
    {
      id: "1",
      name: "Steel Rods",
      sku: "STL-001",
      category: "Raw Materials",
      stock: 250,
      unit: "kg",
      status: "In Stock",
      location: "Warehouse A",
    },
    {
      id: "2",
      name: "Office Chairs",
      sku: "OFC-205",
      category: "Furniture",
      stock: 45,
      unit: "units",
      status: "In Stock",
      location: "Warehouse B",
    },
    {
      id: "3",
      name: "Laptop Batteries",
      sku: "BAT-102",
      category: "Electronics",
      stock: 8,
      unit: "units",
      status: "Low Stock",
      location: "Main Store",
    },
    {
      id: "4",
      name: "Paint Cans",
      sku: "PNT-450",
      category: "Supplies",
      stock: 0,
      unit: "liters",
      status: "Out of Stock",
      location: "Storage Room",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-success text-success-foreground";
      case "Low Stock":
        return "bg-warning text-warning-foreground";
      case "Out of Stock":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and stock levels
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-semibold">{product.stock}</TableCell>
                  <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MongoDB Integration Notice */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-info/10 p-3">
              <Plus className="h-6 w-6 text-info" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                MongoDB Integration Point
              </h3>
              <p className="text-sm text-muted-foreground">
                Product data will be fetched from MongoDB via Flask API endpoints. 
                CRUD operations (Create, Read, Update, Delete) are ready to be connected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
