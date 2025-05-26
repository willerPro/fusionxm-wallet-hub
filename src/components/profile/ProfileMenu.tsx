
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Bot, LogOut, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileMenu = ({ activeTab, onTabChange }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => navigate('/investors')}
      >
        <Users className="mr-2 h-4 w-4" />
        Investors
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
