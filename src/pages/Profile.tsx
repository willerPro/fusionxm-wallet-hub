
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ProfileForm, { UserProfile } from "@/components/profile/ProfileForm";
import ProfileMenu from "@/components/profile/ProfileMenu";
import BotsSection from "@/components/profile/BotsSection";
import SettingsSection from "@/components/profile/SettingsSection";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setProfile({
        fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        email: data.email || user.email || '',
        phone: data.phone || '',
        company: '',
        role: '',
        avatar: '' // avatar_url not in database
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: "There was a problem loading your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData: UserProfile) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Split full name into first and last name
      const nameParts = profileData.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: profileData.email,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setProfile(profileData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveContent = () => {
    if (isLoading && !profile) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return profile && (
          <ProfileForm onSubmit={handleUpdateProfile} isLoading={isLoading} initialData={profile} />
        );
      case 'settings':
        return <SettingsSection />;
      case 'bots':
        return <BotsSection />;
      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <div className="container mx-auto p-3 pb-20 max-w-6xl">
        <h1 className="text-xl font-semibold mb-4 px-1">My Account</h1>
        
        {/* Mobile menu */}
        <div className="mb-4">
          <ProfileMenu activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Content */}
        <div className="w-full">
          {renderActiveContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 pb-20 max-w-6xl">
      <h1 className="text-xl font-semibold mb-4 px-1">My Account</h1>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Desktop sidebar */}
        <div className="lg:w-64 shrink-0">
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <ProfileMenu activeTab={activeTab} onTabChange={setActiveTab} />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1 min-w-0">
          {renderActiveContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
