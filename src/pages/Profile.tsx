
import { useState } from "react";
import ProfileForm, { UserProfile } from "@/components/profile/ProfileForm";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = (profileData: UserProfile) => {
    setIsLoading(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify(profileData));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <ProfileForm onSubmit={handleUpdateProfile} isLoading={isLoading} />
    </div>
  );
};

export default Profile;
