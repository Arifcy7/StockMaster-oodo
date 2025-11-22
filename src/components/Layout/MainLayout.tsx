import { ReactNode, useState, useEffect } from "react";
import { TopNavbar } from "./TopNavbar";
import { authService, rbacService } from "@/services/firebaseService";
import { auth } from "@/firebase/config";
import { User } from "firebase/auth";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user role from Firebase
          const role = await rbacService.getCurrentUserRole();
          setUserRole(role);
        } catch (error) {
          console.error('Failed to get user role:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar userRole={userRole as any} currentUser={currentUser} />
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
};
