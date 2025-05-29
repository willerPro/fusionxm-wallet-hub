
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import AISupport from "@/components/settings/AISupport";
import ProfitSettings from "@/components/settings/ProfitSettings";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const menuItems = [
    {
      id: 'profit',
      label: 'User Profile & Stats',
      icon: TrendingUp,
      description: 'View your profile and account statistics'
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
      setSearchParams({ section: id });
    }
  };

  const handleBack = () => {
    setActiveSection(null);
    setSearchParams({});
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profit':
        return <ProfitSettings onBack={handleBack} />;
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
