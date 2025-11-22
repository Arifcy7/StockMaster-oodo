import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter, Loader2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { auth } from "@/firebase/config";

interface Movement {
  id: string;
  date: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  product: string;
  quantity: string;
  from: string;
  to: string;
  user: string;
  reference: string;
}

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovementHistory();
  }, []);

  const loadMovementHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required');
      }

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/movements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMovements(data.movements || []);
          toast.success(`Loaded ${data.movements?.length || 0} movement records successfully!`);
        } else {
          throw new Error(data.message || 'Failed to load movement history');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error occurred');
      }
    } catch (error: any) {
      console.error('Failed to load movement history:', error);
      setError(`Failed to load movement history: ${error.message}`);
      toast.error(`Failed to load history: ${error.message}`);
      setMovements([]); // No fallback data - completely dynamic
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMovementHistory();
  };

  // Filter movements based on search query
  const filteredMovements = movements.filter(movement =>
    movement.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movement.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movement.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const colors = {
      receipt: 'bg-success text-success-foreground',
      delivery: 'bg-info text-info-foreground',
      transfer: 'bg-warning text-warning-foreground',
      adjustment: 'bg-destructive text-destructive-foreground',
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading movement history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Move History</h1>
          <p className="text-muted-foreground mt-1">
            Complete audit trail of all stock movements
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
              {filteredMovements.map((movement) => (
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
              {filteredMovements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No movements found matching your search.' : 'No movements found.'}
                  </TableCell>
                </TableRow>
              )}
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
