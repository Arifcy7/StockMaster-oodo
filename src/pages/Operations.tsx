import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Truck, ArrowRightLeft, FileText, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Operations = () => {
  // Mock data
  const receipts = [
    { id: "R001", supplier: "Supplier A", items: 5, status: "done", date: "2024-01-20" },
    { id: "R002", supplier: "Supplier B", items: 3, status: "waiting", date: "2024-01-21" },
  ];

  const deliveries = [
    { id: "D001", customer: "Customer X", items: 8, status: "ready", date: "2024-01-20" },
    { id: "D002", customer: "Customer Y", items: 2, status: "draft", date: "2024-01-21" },
  ];

  const transfers = [
    { id: "T001", from: "Warehouse A", to: "Production", items: 4, status: "done", date: "2024-01-20" },
    { id: "T002", from: "Main Store", to: "Warehouse B", items: 6, status: "waiting", date: "2024-01-21" },
  ];

  const adjustments = [
    { id: "A001", product: "Steel Rods", quantity: -5, reason: "Damaged", status: "done", date: "2024-01-19" },
    { id: "A002", product: "Paint Cans", quantity: 10, reason: "Count Correction", status: "done", date: "2024-01-20" },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-muted text-muted-foreground',
      waiting: 'bg-warning text-warning-foreground',
      ready: 'bg-info text-info-foreground',
      done: 'bg-success text-success-foreground',
      canceled: 'bg-destructive text-destructive-foreground',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operations</h1>
          <p className="text-muted-foreground mt-1">
            Manage receipts, deliveries, transfers, and adjustments
          </p>
        </div>
      </div>

      <Tabs defaultValue="receipts" className="w-full">
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

        <TabsContent value="receipts">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Incoming Goods Receipts</CardTitle>
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Receipt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.id}</TableCell>
                      <TableCell>{receipt.supplier}</TableCell>
                      <TableCell>{receipt.items}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(receipt.status)}>{receipt.status}</Badge>
                      </TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Outgoing Delivery Orders</CardTitle>
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Delivery
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell>{delivery.customer}</TableCell>
                      <TableCell>{delivery.items}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(delivery.status)}>{delivery.status}</Badge>
                      </TableCell>
                      <TableCell>{delivery.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Internal Transfers</CardTitle>
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Transfer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.id}</TableCell>
                      <TableCell>{transfer.from}</TableCell>
                      <TableCell>{transfer.to}</TableCell>
                      <TableCell>{transfer.items}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transfer.status)}>{transfer.status}</Badge>
                      </TableCell>
                      <TableCell>{transfer.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Adjustments</CardTitle>
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Adjustment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="font-medium">{adjustment.id}</TableCell>
                      <TableCell>{adjustment.product}</TableCell>
                      <TableCell className={adjustment.quantity < 0 ? "text-destructive" : "text-success"}>
                        {adjustment.quantity > 0 ? '+' : ''}{adjustment.quantity}
                      </TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(adjustment.status)}>{adjustment.status}</Badge>
                      </TableCell>
                      <TableCell>{adjustment.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Operations;
