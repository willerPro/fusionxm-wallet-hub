
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import AISupport from "@/components/settings/AISupport";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'profit',
      label: 'Profit Settings',
      icon: TrendingUp,
      description: 'Manage your profit preferences and targets'
    },
    {
      id: 'investors',
      label: 'Investors',
      icon: Users,
      description: 'View and manage investor relationships'
    },
    {
      id: 'support',
      label: 'AI Support',
      icon: MessageCircle,
      description: 'Chat with our AI assistant for help'
    }
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'investors') {
      navigate('/investors');
    } else {
      setActiveSection(id);
    }
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profit':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">Profit Settings</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Profit settings configuration will be available here.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'support':
        return <AISupport />;
      default:
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleMenuClick(item.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{item.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  // For mobile, when support is active, render full screen chat
  if (activeSection === 'support' && isMobile) {
    return <AISupport />;
  }

  return (
    <div className="container mx-auto p-4 pb-20 max-w-6xl">
      {renderContent()}
    </div>
  );
};

export default Settings;
