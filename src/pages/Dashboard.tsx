import { useState, useEffect } from "react";
import { Package, AlertTriangle, PackageOpen, Truck, ArrowRightLeft } from "lucide-react";
import { KPICard } from "@/components/Dashboard/KPICard";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dashboard } from "@/services/firebase";

const Dashboard = () => {
  const [kpiData, setKpiData] = useState([
    {
      title: "Total Products in Stock",
      value: "Loading...",
      icon: Package,
      trend: { value: "Loading...", isPositive: true },
      variant: 'default' as const,
    },
    {
      title: "Low Stock Items",
      value: "Loading...",
      icon: AlertTriangle,
      trend: { value: "Checking...", isPositive: false },
      variant: 'warning' as const,
    },
    {
      title: "Pending Receipts",
      value: "Loading...",
      icon: PackageOpen,
      variant: 'info' as const,
    },
    {
      title: "Pending Deliveries",
      value: "Loading...",
      icon: Truck,
      variant: 'success' as const,
    },
    {
      title: "Internal Transfers",
      value: "Loading...",
      icon: ArrowRightLeft,
      variant: 'default' as const,
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get dashboard data from Firebase
      const dashboardData = await dashboard.getStats();
      
      console.log('Dashboard data received:', dashboardData);
      
      // Update KPI data with real data from Firebase
      setKpiData([
        {
          title: "Total Products in Stock",
          value: dashboardData.products?.total?.toString() || "0",
          icon: Package,
          trend: { 
            value: dashboardData.products?.trend?.value || `${dashboardData.products?.in_stock || 0} in stock`, 
            isPositive: dashboardData.products?.trend?.is_positive ?? true 
          },
          variant: 'default' as const,
        },
        {
          title: "Low Stock Items",
          value: dashboardData.products?.low_stock?.toString() || "0",
          icon: AlertTriangle,
          trend: { 
            value: dashboardData.products?.low_stock > 0 ? "Requires attention" : "No items low on stock", 
            isPositive: dashboardData.products?.low_stock === 0 
          },
          variant: 'warning' as const,
        },
        {
          title: "Pending Receipts",
          value: dashboardData.operations?.pending_receipts?.toString() || "0",
          icon: PackageOpen,
          variant: 'default' as const,
        },
        {
          title: "Pending Deliveries",
          value: dashboardData.operations?.pending_deliveries?.toString() || "0",
          icon: Truck,
          variant: 'default' as const,
        },
        {
          title: "Internal Transfers",
          value: dashboardData.operations?.internal_transfers?.toString() || "0",
          icon: ArrowRightLeft,
          variant: 'default' as const,
        },
      ]);
      
      toast.success("Dashboard data loaded successfully!");
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data from Firebase");
      toast.error("Failed to load dashboard data: " + error.message);
      
      // Show empty state instead of demo data
      setKpiData([
        {
          title: "Total Products in Stock",
          value: "0",
          icon: Package,
          trend: { value: "No data available", isPositive: false },
          variant: 'default' as const,
        },
        {
          title: "Low Stock Items",
          value: "0",
          icon: AlertTriangle,
          trend: { value: "No products to monitor", isPositive: true },
          variant: 'warning' as const,
        },
        {
          title: "Pending Receipts",
          value: "0",
          icon: PackageOpen,
          trend: { value: "No pending receipts", isPositive: true },
          variant: 'default' as const,
        },
        {
          title: "Pending Deliveries",
          value: "0",
          icon: Truck,
          trend: { value: "No pending deliveries", isPositive: true },
          variant: 'default' as const,
        },
        {
          title: "Internal Transfers",
          value: "0",
          icon: ArrowRightLeft,
          trend: { value: "No transfers in progress", isPositive: true },
          variant: 'default' as const,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your inventory operations
            {error && (
              <span className="text-orange-500 ml-2">({error})</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            Export Report
          </Button>
          <Button className="bg-gradient-primary">
            Quick Actions
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
        
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Products Added Today</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {isLoading ? "..." : "0"}
                  </p>
                </div>
                <Badge className="bg-muted text-muted-foreground">
                  {error ? "No Data" : "Empty"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Orders Processed</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {isLoading ? "..." : "0"}
                  </p>
                </div>
                <Badge className="bg-muted text-muted-foreground">
                  {error ? "No Data" : "Empty"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Stock Movements</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {isLoading ? "..." : "0"}
                  </p>
                </div>
                <Badge className="bg-muted text-muted-foreground">
                  {error ? "No Data" : "Empty"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Status Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-orange-100 p-3">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Empty Database Mode
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                The system is currently running with an empty database. All sections show zero data 
                because no database is connected. Use the "Add Product", "Add User", and other create 
                functions to populate the database, or connect a real database to see actual data.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Add Sample Data
                </Button>
                <Button variant="outline" size="sm">
                  Connect Database
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
