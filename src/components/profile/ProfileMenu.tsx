
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Bot, LogOut, User, Users, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";

interface ProfileMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileMenu = ({ activeTab, onTabChange }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  
  // Check if user has permission to access restricted pages
  const hasRestrictedAccess = user?.email === "moisentak@gmail.com";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigateToInvestors = () => {
    if (hasRestrictedAccess) {
      navigate('/investors');
    } else {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToPackages = () => {
    if (hasRestrictedAccess) {
      navigate('/packages');
    } else {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full sm:w-64">
      <Button
        variant={activeTab === 'profile' ? 'default' : 'ghost'}
        className="justify-start"
        onClick={() => onTabChange('profile')}
      >
        <User className="mr-2 h-4 w-4" />
        Profile Details
      </Button>
      <Button
        variant={activeTab === 'settings' ? 'default' : 'ghost'}
        className="justify-start"
        onClick={() => onTabChange('settings')}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      <Button
        variant={activeTab === 'bots' ? 'default' : 'ghost'}
        className="justify-start"
        onClick={() => onTabChange('bots')}
      >
        <Bot className="mr-2 h-4 w-4" />
        Trading Bots
      </Button>
      
      {/* Restricted access menu items */}
      <Button
        variant="ghost"
        className={`justify-start ${!hasRestrictedAccess ? 'opacity-50' : ''}`}
        onClick={handleNavigateToInvestors}
      >
        <Users className="mr-2 h-4 w-4" />
        Investors
        {!hasRestrictedAccess && <span className="ml-2 text-xs text-gray-400">(Restricted)</span>}
      </Button>
      
      <Button
        variant="ghost"
        className={`justify-start ${!hasRestrictedAccess ? 'opacity-50' : ''}`}
        onClick={handleNavigateToPackages}
      >
        <Package className="mr-2 h-4 w-4" />
        Packages
        {!hasRestrictedAccess && <span className="ml-2 text-xs text-gray-400">(Restricted)</span>}
      </Button>
      
      <hr className="my-2" />
      <Button
        variant="ghost"
        className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? 'Logging Out...' : 'Logout'}
      </Button>
    </div>
  );
};

export default ProfileMenu;
