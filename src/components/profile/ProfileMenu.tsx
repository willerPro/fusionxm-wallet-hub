
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Bot, LogOut, User, Users, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProfileMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileMenu = ({ activeTab, onTabChange }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
    {
      id: 'bots',
      label: 'Bots',
      icon: Bot,
    },
  ];

  const MenuContent = () => (
    <div className="flex flex-col space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className="justify-start w-full"
          onClick={() => handleTabChange(item.id)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
      
      <Button
        variant="ghost"
        className="justify-start w-full"
        onClick={() => navigate('/investors')}
      >
        <Users className="mr-2 h-4 w-4" />
        Investors
      </Button>
      
      <hr className="my-2" />
      
      <Button
        variant="ghost"
        className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? 'Logging Out...' : 'Logout'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Menu className="mr-2 h-4 w-4" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Account Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <MenuContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-full">
      <MenuContent />
    </div>
  );
};

export default ProfileMenu;
