
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
    <div className="w-full">
      {/* Mobile: Horizontal scrollable menu */}
      <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          className="justify-start whitespace-nowrap flex-shrink-0 lg:w-full text-xs lg:text-sm px-3 py-2 h-8 lg:h-9"
          onClick={() => onTabChange('profile')}
        >
          <User className="mr-1.5 h-3 w-3 lg:h-4 lg:w-4" />
          <span className="hidden sm:inline">Profile</span>
          <span className="sm:hidden">Profile</span>
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          className="justify-start whitespace-nowrap flex-shrink-0 lg:w-full text-xs lg:text-sm px-3 py-2 h-8 lg:h-9"
          onClick={() => onTabChange('settings')}
        >
          <Settings className="mr-1.5 h-3 w-3 lg:h-4 lg:w-4" />
          <span className="hidden sm:inline">Settings</span>
          <span className="sm:hidden">Settings</span>
        </Button>
        <Button
          variant={activeTab === 'bots' ? 'default' : 'ghost'}
          className="justify-start whitespace-nowrap flex-shrink-0 lg:w-full text-xs lg:text-sm px-3 py-2 h-8 lg:h-9"
          onClick={() => onTabChange('bots')}
        >
          <Bot className="mr-1.5 h-3 w-3 lg:h-4 lg:w-4" />
          <span className="hidden sm:inline">Bots</span>
          <span className="sm:hidden">Bots</span>
        </Button>
        
        <Button
          variant="ghost"
          className="justify-start whitespace-nowrap flex-shrink-0 lg:w-full text-xs lg:text-sm px-3 py-2 h-8 lg:h-9"
          onClick={() => navigate('/investors')}
        >
          <Users className="mr-1.5 h-3 w-3 lg:h-4 lg:w-4" />
          <span className="hidden sm:inline">Investors</span>
          <span className="sm:hidden">Investors</span>
        </Button>
        
        <div className="hidden lg:block">
          <hr className="my-2" />
        </div>
        
        <Button
          variant="ghost"
          className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50 whitespace-nowrap flex-shrink-0 lg:w-full text-xs lg:text-sm px-3 py-2 h-8 lg:h-9"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-1.5 h-3 w-3 lg:h-4 lg:w-4" />
          <span className="hidden sm:inline">{isLoggingOut ? 'Logging Out...' : 'Logout'}</span>
          <span className="sm:hidden">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileMenu;
