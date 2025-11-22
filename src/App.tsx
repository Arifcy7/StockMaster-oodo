import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { AdminRoute } from "./components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Operations from "./pages/Operations";
import Admin from "./pages/Admin";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
            <Route path="/operations" element={<MainLayout><Operations /></MainLayout>} />
            <Route path="/admin" element={
              <MainLayout>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </MainLayout>
            } />
            <Route path="/history" element={<MainLayout><History /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
