import { useState, useEffect } from "react";
import { Package, AlertTriangle, PackageOpen, Truck, ArrowRightLeft } from "lucide-react";
import { KPICard } from "@/components/Dashboard/KPICard";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getDashboardData } from "@/services/api";

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
      
      // Try to get dashboard data from backend
      const response = await getDashboardData();
      const dashboardData = response.data;
      
      // Update KPI data with real data from backend
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
          trend: { value: "Requires attention", isPositive: false },
          variant: 'warning' as const,
        },
        {
          title: "Pending Receipts",
          value: dashboardData.operations?.pending_receipts?.toString() || "0",
          icon: PackageOpen,
          variant: 'info' as const,
        },
        {
          title: "Pending Deliveries",
          value: dashboardData.operations?.pending_deliveries?.toString() || "0",
          icon: Truck,
          variant: 'success' as const,
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
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data. Using demo data.");
      
      // Fallback to demo data
      setKpiData([
        {
          title: "Total Products in Stock",
          value: "1,234",
          icon: Package,
          trend: { value: "+12% from last month", isPositive: true },
          variant: 'default' as const,
        },
        {
          title: "Low Stock Items",
          value: "23",
          icon: AlertTriangle,
          trend: { value: "Requires attention", isPositive: false },
          variant: 'warning' as const,
        },
        {
          title: "Pending Receipts",
          value: "15",
          icon: PackageOpen,
          variant: 'info' as const,
        },
        {
          title: "Pending Deliveries",
          value: "8",
          icon: Truck,
          variant: 'success' as const,
        },
        {
          title: "Internal Transfers",
          value: "5",
          icon: ArrowRightLeft,
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
          </p>
        </div>
        <div className="flex gap-2">
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
                  <p className="text-2xl font-bold text-primary mt-1">12</p>
                </div>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Orders Processed</p>
                  <p className="text-2xl font-bold text-primary mt-1">47</p>
                </div>
                <Badge className="bg-info text-info-foreground">Today</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Stock Movements</p>
                  <p className="text-2xl font-bold text-primary mt-1">89</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">This Week</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firebase Integration Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Backend Integration Ready
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This dashboard is ready to connect with your Firebase authentication, 
                MongoDB database, and Flask backend. All data displayed is currently mock data 
                that will be replaced with real-time data once integrated.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Setup Firebase Auth
                </Button>
                <Button variant="outline" size="sm">
                  Configure MongoDB
                </Button>
                <Button variant="outline" size="sm">
                  Connect Flask API
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
