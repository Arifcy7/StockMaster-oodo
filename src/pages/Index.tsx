import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Shield, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg">
            <Package className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">StockMaster</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            A comprehensive Inventory Management System designed to digitize and streamline 
            all stock-related operations within your business
          </p>
          
          <div className="flex gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate('/dashboard')}
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Role-Based Access</h3>
            <p className="text-muted-foreground">
              Three-tier role system: Admin, Inventory Manager, and Warehouse Staff with granular permissions
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time Analytics</h3>
            <p className="text-muted-foreground">
              Track stock levels, monitor movements, and get instant alerts for low inventory
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-info to-info/80 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Complete Operations</h3>
            <p className="text-muted-foreground">
              Manage receipts, deliveries, internal transfers, and inventory adjustments seamlessly
            </p>
          </div>
        </div>

        {/* Integration Notice */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Backend Integration Ready
            </h2>
            <p className="text-muted-foreground mb-6">
              StockMaster is architected to seamlessly integrate with Firebase Authentication, 
              MongoDB database, and Flask backend API. All integration points are clearly marked 
              and ready for connection.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-card border">
                🔥 Firebase Auth
              </div>
              <div className="px-4 py-2 rounded-lg bg-card border">
                🍃 MongoDB
              </div>
              <div className="px-4 py-2 rounded-lg bg-card border">
                🌶️ Flask API
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
