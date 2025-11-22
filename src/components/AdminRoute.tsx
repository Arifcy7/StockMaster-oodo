import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { rbacService } from "@/services/firebaseService";
import { auth } from "@/firebase/config";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = auth.currentUser;
        setCurrentUser(user);
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check if user has admin role
        const adminStatus = await rbacService.isAdmin(user.email!);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking admin permissions...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
                <p className="text-muted-foreground mt-2">
                  You need administrator privileges to access this page.
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Contact your system administrator if you believe this is an error.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};