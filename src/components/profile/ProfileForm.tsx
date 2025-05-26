
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export type UserProfile = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  avatar?: string;
};

type ProfileFormProps = {
  onSubmit: (profileData: UserProfile) => void;
  isLoading: boolean;
  initialData?: UserProfile;
};

const ProfileForm = ({ onSubmit, isLoading, initialData }: ProfileFormProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setProfile((prev) => ({
            ...prev,
            ...userData,
          }));
        } catch (error) {
          console.error("Failed to parse user data", error);
        }
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">My Profile</CardTitle>
        <CardDescription className="text-sm">Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="text-sm lg:text-base bg-primary text-white">
              {profile.fullName ? getInitials(profile.fullName) : <User className="h-6 w-6 lg:h-8 lg:w-8" />}
            </AvatarFallback>
          </Avatar>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={profile.fullName}
              onChange={handleChange}
              required
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={profile.email}
              onChange={handleChange}
              required
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={profile.phone}
              onChange={handleChange}
              className="h-9"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                name="company"
                placeholder="Your Company"
                value={profile.company}
                onChange={handleChange}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Input
                id="role"
                name="role"
                placeholder="Your Position"
                value={profile.role}
                onChange={handleChange}
                className="h-9"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 h-9"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
