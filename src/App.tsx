
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Wallets from "./pages/Wallets";
import WalletDetails from "./pages/WalletDetails";
import Investors from "./pages/Investors";
import Activities from "./pages/Activities";
import Packages from "./pages/Packages";
import Profile from "./pages/Profile";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import CryptoTransactions from "./pages/CryptoTransactions";
import TransactionDetails from "./pages/TransactionDetails";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/auth/AuthContext";

const App = () => {
  // Create a new QueryClient instance
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MainLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallets" element={<Wallets />} />
                <Route path="/wallets/:id" element={<WalletDetails />} />
                <Route path="/investors" element={<Investors />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/crypto" element={<CryptoTransactions />} />
                <Route path="/transactions/:id" element={<TransactionDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
