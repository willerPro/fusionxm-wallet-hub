
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/wallets":
        return "Wallets";
      case "/investors":
        return "Investors";
      case "/packages":
        return "Investment Packages";
      case "/profile":
        return "Profile";
      case "/add-investor":
        return "Add Investor";
      case "/create-package":
        return "Create Package";
      case "/deposit":
        return "Deposit";
      case "/withdraw":
        return "Withdraw";
      default:
        return "NEXORAVEST";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logout successful",
      description: "You have been logged out",
      duration: 2000,
    });
    navigate("/login");
  };

  if (["/login", "/signup", "/"].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-secondary px-4 py-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-primary">{getPageTitle()}</h1>
        </div>
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="text-primary"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
