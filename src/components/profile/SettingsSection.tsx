
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Key, Eye, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

type UserSettings = {
  email_alerts: boolean;
  bot_alerts: boolean;
  market_alerts: boolean;
  news_updates: boolean;
  two_factor: boolean;
  login_alerts: boolean;
};

const SettingsSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    botAlerts: true,
    marketAlerts: false,
    newsUpdates: false
  });
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw error;
      }

      if (data) {
        setNotifications({
          emailAlerts: data.email_alerts ?? true,
          botAlerts: data.bot_alerts ?? true,
          marketAlerts: data.market_alerts ?? false,
          newsUpdates: data.news_updates ?? false
        });
        
        setSecurity({
          twoFactor: data.two_factor ?? false,
          loginAlerts: data.login_alerts ?? true
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error loading settings",
        description: "There was a problem loading your settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_alerts: notifications.emailAlerts,
          bot_alerts: notifications.botAlerts,
          market_alerts: notifications.marketAlerts,
          news_updates: notifications.newsUpdates,
          two_factor: security.twoFactor,
          login_alerts: security.loginAlerts,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggle = async (section: 'notifications' | 'security', key: string, value: boolean) => {
    if (section === 'notifications') {
      setNotifications({
        ...notifications,
        [key]: value
      });
    } else {
      setSecurity({
        ...security,
        [key]: value
      });
    }
    
    // Wait a bit to let the UI update before saving to DB
    setTimeout(() => {
      saveSettings();
    }, 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Alerts</h3>
              <p className="text-sm text-gray-500">Receive important account notifications via email</p>
            </div>
            <Switch 
              checked={notifications.emailAlerts} 
              onCheckedChange={(checked) => handleToggle('notifications', 'emailAlerts', checked)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Bot Notifications</h3>
              <p className="text-sm text-gray-500">Get notified about your bot activities and status changes</p>
            </div>
            <Switch 
              checked={notifications.botAlerts} 
              onCheckedChange={(checked) => handleToggle('notifications', 'botAlerts', checked)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Market Alerts</h3>
              <p className="text-sm text-gray-500">Receive notifications about market changes and opportunities</p>
            </div>
            <Switch 
              checked={notifications.marketAlerts} 
              onCheckedChange={(checked) => handleToggle('notifications', 'marketAlerts', checked)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">News & Updates</h3>
              <p className="text-sm text-gray-500">Get the latest news and platform updates</p>
            </div>
            <Switch 
              checked={notifications.newsUpdates} 
              onCheckedChange={(checked) => handleToggle('notifications', 'newsUpdates', checked)} 
            />
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Switch 
              checked={security.twoFactor} 
              onCheckedChange={(checked) => handleToggle('security', 'twoFactor', checked)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Login Alerts</h3>
              <p className="text-sm text-gray-500">Get notified of new login attempts</p>
            </div>
            <Switch 
              checked={security.loginAlerts} 
              onCheckedChange={(checked) => handleToggle('security', 'loginAlerts', checked)} 
            />
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Account</h2>
        </div>
        <Accordion type="single" collapsible className="bg-white rounded-lg border">
          <AccordionItem value="change-password">
            <AccordionTrigger className="px-4">Change Password</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" /> Change Password
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                We'll send you an email with a link to change your password.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delete-account">
            <AccordionTrigger className="px-4">Delete Account</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Button variant="destructive" className="w-full">Delete Account</Button>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default SettingsSection;
