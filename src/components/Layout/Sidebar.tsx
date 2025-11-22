import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  History, 
  Settings, 
  User, 
  LogOut,
  PackageOpen,
  Truck,
  ArrowRightLeft,
  FileText,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/firebaseService";
import { User as FirebaseUser } from "firebase/auth";
import { toast } from "sonner";

interface SidebarProps {
  userRole?: 'admin' | 'inventory_manager' | 'warehouse_staff' | null;
  currentUser?: FirebaseUser | null;
}

export const Sidebar = ({ userRole, currentUser }: SidebarProps) => {
  const mainNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
  ];

  const operationsItems = [
    { to: "/operations", label: "Operations", icon: ClipboardList },
  ];

  const bottomNavItems = [
    { to: "/history", label: "Move History", icon: History },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  // Admin-only items - only show if user has admin role
  const adminItems = userRole === 'admin' ? [
    { to: "/admin", label: "Admin Panel", icon: Shield },
  ] : [];

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
      // Redirect will be handled by auth state change
    } catch (error: any) {
      toast.error('Failed to logout: ' + error.message);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">StockMaster</h1>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {userRole || 'User'}
                {userRole === 'admin' && ' 🔑'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {/* Main */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Main
              </h3>
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Operations */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Operations
              </h3>
              <div className="space-y-1">
                {operationsItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Admin Section - Only visible to admin users */}
            {adminItems.length > 0 && (
              <div>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  Administration
                </h3>
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-orange-200 bg-orange-50 hover:bg-orange-100"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}

            {/* System */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                System
              </h3>
              <div className="space-y-1">
                {bottomNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Profile */}
        <div className="border-t border-sidebar-border p-4">
          <div className="space-y-1">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <User className="h-4 w-4" />
              My Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
          
          {/* User Info */}
          {currentUser && (
            <div className="mt-4 pt-4 border-t border-sidebar-border/50">
              <div className="px-3">
                <p className="text-xs font-medium text-sidebar-foreground">
                  {currentUser.displayName || currentUser.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
