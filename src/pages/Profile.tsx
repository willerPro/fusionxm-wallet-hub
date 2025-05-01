
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import ProfileForm, { UserProfile } from "@/components/profile/ProfileForm";
import ProfileMenu from "@/components/profile/ProfileMenu";
import BotsSection from "@/components/profile/BotsSection";
import SettingsSection from "@/components/profile/SettingsSection";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
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
        phone: '',
        company: '',
        role: '',
        avatar: data.avatar_url
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
          avatar_url: profileData.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
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

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-semibold mb-6">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-64 shrink-0">
          <CardContent className="p-4">
            <ProfileMenu activeTab={activeTab} onTabChange={setActiveTab} />
          </CardContent>
        </Card>
        
        <div className="flex-1">
          {activeTab === 'profile' && profile && (
            <ProfileForm onSubmit={handleUpdateProfile} isLoading={isLoading} initialData={profile} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsSection />
          )}
          
          {activeTab === 'bots' && (
            <BotsSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
