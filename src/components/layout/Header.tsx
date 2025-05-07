
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Get user profile data from localStorage
  const userProfile = user ? (
    localStorage.getItem("userProfile") ? 
    JSON.parse(localStorage.getItem("userProfile") || "{}") : 
    {}
  ) : null;
  
  const displayName = userProfile?.fullName || "";

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
    localStorage.removeItem("userProfile");
    toast({
      title: "Logout successful",
      description: "You have been logged out",
      duration: 2000,
    });
    navigate("/login");
  };
  
  const handleSaveName = async () => {
    if (!user || !userName.trim()) return;
    
    setLoading(true);
    try {
      // Split name into first and last name
      const nameParts = userName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local storage
      const updatedProfile = {
        ...userProfile,
        fullName: userName.trim()
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      toast({
        title: "Name updated",
        description: "Your name has been saved successfully",
        duration: 2000,
      });
      
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Failed to update name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        
        <div className="flex items-center gap-2">
          {user && (
            <>
              {!isEditingName ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 mr-1"
                  onClick={() => {
                    if (!displayName) {
                      setIsEditingName(true);
                    } else {
                      navigate('/profile');
                    }
                  }}
                >
                  <User className="h-4 w-4" />
                  {displayName ? displayName : "Set name"}
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-8 w-40 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveName();
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <Button 
                    variant="default" 
                    size="sm"
                    className="h-8"
                    onClick={handleSaveName}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8"
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
          
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
      </div>
    </header>
  );
};

export default Header;
