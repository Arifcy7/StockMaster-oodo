import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Operations from "./pages/Operations";
import Admin from "./pages/Admin";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // TODO: Get actual user role from Firebase Authentication
  const userRole: 'admin' | 'manager' | 'staff' = 'admin';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<MainLayout userRole={userRole}><Dashboard /></MainLayout>} />
            <Route path="/products" element={<MainLayout userRole={userRole}><Products /></MainLayout>} />
            <Route path="/operations/*" element={<MainLayout userRole={userRole}><Operations /></MainLayout>} />
            <Route path="/admin" element={<MainLayout userRole={userRole}><Admin /></MainLayout>} />
            <Route path="/history" element={<MainLayout userRole={userRole}><History /></MainLayout>} />
            <Route path="/settings" element={<MainLayout userRole={userRole}><Settings /></MainLayout>} />
            <Route path="/profile" element={<MainLayout userRole={userRole}><Profile /></MainLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
