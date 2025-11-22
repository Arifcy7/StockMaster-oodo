import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Truck, ArrowRightLeft, FileText, Plus, Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { auth } from "@/firebase/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Operation {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  title: string;
  description: string;
  status: string;
  date: string;
  items?: number;
  supplier?: string;
  customer?: string;
  from?: string;
  to?: string;
  product?: string;
  quantity?: number;
  reason?: string;
}

const Operations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required');
      }

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/operations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOperations(data.operations || []);
          toast.success(`Loaded ${data.operations?.length || 0} operations successfully!`);
        } else {
          throw new Error(data.message || 'Failed to load operations');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error occurred');
      }
    } catch (error: any) {
      console.error('Failed to load operations:', error);
      setError(`Failed to load operations: ${error.message}`);
      toast.error(`Failed to load operations: ${error.message}`);
      setOperations([]); // No fallback - completely dynamic
    } finally {
      setIsLoading(false);
    }
  };

  // Filter operations by type
  const receipts = operations.filter(op => op.type === 'receipt');
  const deliveries = operations.filter(op => op.type === 'delivery');
  const transfers = operations.filter(op => op.type === 'transfer');
  const adjustments = operations.filter(op => op.type === 'adjustment');

  // Refresh operations
  const handleRefresh = () => {
    loadOperations();
  };

  // Create new operation
  const handleCreateOperation = async (type: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Authentication required');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/operations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          createdBy: user.uid
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(`New ${type} operation created!`);
          loadOperations(); // Reload operations
        } else {
          throw new Error(data.message);
        }
      } else {
        throw new Error('Failed to create operation');
      }
    } catch (error: any) {
      console.error('Failed to create operation:', error);
      toast.error(`Failed to create operation: ${error.message}`);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading operations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operations</h1>
          <p className="text-muted-foreground mt-1">
            Manage receipts, deliveries, transfers, and adjustments
          </p>
          {error && (
            <p className="text-yellow-600 text-sm mt-1">⚠️ {error}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={() => handleCreateOperation('general')}>
            <Plus className="h-4 w-4" />
            New Operation
          </Button>
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
                <Button className="bg-gradient-primary" onClick={() => handleCreateOperation('receipt')}>
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
                <Button className="bg-gradient-primary" onClick={() => handleCreateOperation('delivery')}>
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
                <Button className="bg-gradient-primary" onClick={() => handleCreateOperation('transfer')}>
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
                <Button className="bg-gradient-primary" onClick={() => handleCreateOperation('adjustment')}>
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
