
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface KycFormProps {
  onSubmit: (data: {
    username: string;
    full_names: string;
    identity_type: string;
    identity_number: string;
    location: string;
    picture: string;
    front_pic_id: string;
    rear_pic_id: string;
  }) => void;
  isLoading: boolean;
  initialData?: {
    username: string;
    full_names: string;
    identity_type: string;
    identity_number: string;
    location: string | null;
    picture: string | null;
    front_pic_id: string | null;
    rear_pic_id: string | null;
  } | null;
}

const KycForm = ({ onSubmit, isLoading, initialData }: KycFormProps) => {
  const [formData, setFormData] = useState({
    username: "",
    full_names: "",
    identity_type: "",
    identity_number: "",
    location: "",
    picture: "",
    front_pic_id: "",
    rear_pic_id: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        full_names: initialData.full_names,
        identity_type: initialData.identity_type,
        identity_number: initialData.identity_number,
        location: initialData.location || "",
        picture: initialData.picture || "",
        front_pic_id: initialData.front_pic_id || "",
        rear_pic_id: initialData.rear_pic_id || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isViewMode = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Username"
          required
          disabled={isViewMode}
        />
      </div>

      <div>
        <Label htmlFor="full_names">Full Names</Label>
        <Input
          id="full_names"
          value={formData.full_names}
          onChange={(e) => setFormData(prev => ({ ...prev, full_names: e.target.value }))}
          placeholder="Full legal names"
          required
          disabled={isViewMode}
        />
      </div>

      <div>
        <Label htmlFor="identity_type">Identity Type</Label>
        <Select 
          value={formData.identity_type} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, identity_type: value }))}
          disabled={isViewMode}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select identity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="national_id">National ID</SelectItem>
            <SelectItem value="drivers_license">Driver's License</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="identity_number">Identity Number</Label>
        <Input
          id="identity_number"
          value={formData.identity_number}
          onChange={(e) => setFormData(prev => ({ ...prev, identity_number: e.target.value }))}
          placeholder="Identity document number"
          required
          disabled={isViewMode}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="City, Country"
          disabled={isViewMode}
        />
      </div>

      <div>
        <Label htmlFor="picture">Profile Picture URL</Label>
        <Input
          id="picture"
          value={formData.picture}
          onChange={(e) => setFormData(prev => ({ ...prev, picture: e.target.value }))}
          placeholder="https://example.com/profile.jpg"
          disabled={isViewMode}
        />
      </div>

      <div>
        <Label htmlFor="front_pic_id">Front ID Picture URL</Label>
        <Input
          id="front_pic_id"
          value={formData.front_pic_id}
          onChange={(e) => setFormData(prev => ({ ...prev, front_pic_id: e.target.value }))}
          placeholder="https://example.com/front-id.jpg"
          disabled={isViewMode}
        />
      </div>

      <div>
        <Label htmlFor="rear_pic_id">Rear ID Picture URL</Label>
        <Input
          id="rear_pic_id"
          value={formData.rear_pic_id}
          onChange={(e) => setFormData(prev => ({ ...prev, rear_pic_id: e.target.value }))}
          placeholder="https://example.com/rear-id.jpg"
          disabled={isViewMode}
        />
      </div>

      {!isViewMode && (
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding KYC...
            </>
          ) : (
            'Add KYC Information'
          )}
        </Button>
      )}
    </form>
  );
};

export default KycForm;
