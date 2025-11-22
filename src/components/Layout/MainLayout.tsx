import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";

interface MainLayoutProps {
  children: ReactNode;
  userRole?: 'admin' | 'inventory_manager' | 'warehouse_staff';
}

export const MainLayout = ({ children, userRole }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar userRole={userRole} />
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
};
