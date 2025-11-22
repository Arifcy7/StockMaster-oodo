import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with MongoDB data via Flask API
  const movements = [
    {
      id: "M001",
      date: "2024-01-20 14:30",
      type: "receipt",
      product: "Steel Rods",
      quantity: "+100",
      from: "Supplier A",
      to: "Warehouse A",
      user: "John Doe",
      reference: "R001",
    },
    {
      id: "M002",
      date: "2024-01-20 15:45",
      type: "delivery",
      product: "Office Chairs",
      quantity: "-50",
      from: "Warehouse B",
      to: "Customer X",
      user: "Jane Smith",
      reference: "D001",
    },
    {
      id: "M003",
      date: "2024-01-20 16:20",
      type: "transfer",
      product: "Laptop Batteries",
      quantity: "30",
      from: "Main Store",
      to: "Production Floor",
      user: "Bob Wilson",
      reference: "T001",
    },
    {
      id: "M004",
      date: "2024-01-19 11:15",
      type: "adjustment",
      product: "Paint Cans",
      quantity: "-5",
      from: "Warehouse A",
      to: "Damaged Stock",
      user: "John Doe",
      reference: "A001",
    },
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      receipt: 'bg-success text-success-foreground',
      delivery: 'bg-info text-info-foreground',
      transfer: 'bg-warning text-warning-foreground',
      adjustment: 'bg-destructive text-destructive-foreground',
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Move History</h1>
          <p className="text-muted-foreground mt-1">
            Complete audit trail of all stock movements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, reference, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Stock Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-muted-foreground">{movement.date}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(movement.type)}>
                      {movement.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{movement.product}</TableCell>
                  <TableCell className={movement.quantity.startsWith('+') ? 'text-success font-semibold' : movement.quantity.startsWith('-') ? 'text-destructive font-semibold' : 'font-semibold'}>
                    {movement.quantity}
                  </TableCell>
                  <TableCell>{movement.from}</TableCell>
                  <TableCell>{movement.to}</TableCell>
                  <TableCell className="text-muted-foreground">{movement.user}</TableCell>
                  <TableCell>
                    <Button variant="link" className="h-auto p-0 text-primary">
                      {movement.reference}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Card className="border-success/20 bg-success/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-success/10 p-3">
              <Search className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Stock Ledger Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                This stock ledger maintains a complete audit trail of all inventory movements. 
                Connect to MongoDB via Flask API to store and retrieve historical data with 
                advanced filtering and reporting capabilities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
