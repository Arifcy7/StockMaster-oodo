import { Package, AlertTriangle, PackageOpen, Truck, ArrowRightLeft } from "lucide-react";
import { KPICard } from "@/components/Dashboard/KPICard";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  // Mock data - will be replaced with Firebase/MongoDB data
  const kpiData = [
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
  ];

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
