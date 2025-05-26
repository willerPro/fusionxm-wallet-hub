
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ActivityFormProps {
  onSubmit: (data: {
    activity_type: string;
    description: string;
    status: string;
    date_ended?: string;
  }) => void;
  isLoading: boolean;
  initialData?: {
    activity_type: string;
    description: string | null;
    status: string;
    date_ended: string | null;
  } | null;
}

const ActivityForm = ({ onSubmit, isLoading, initialData }: ActivityFormProps) => {
  const [formData, setFormData] = useState({
    activity_type: "",
    description: "",
    status: "active",
    date_ended: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        activity_type: initialData.activity_type,
        description: initialData.description || "",
        status: initialData.status,
        date_ended: initialData.date_ended ? initialData.date_ended.split('T')[0] : "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      activity_type: formData.activity_type,
      description: formData.description,
      status: formData.status,
      date_ended: formData.date_ended || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="activity_type">Activity Type</Label>
        <Select value={formData.activity_type} onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Contract Bot">Contract Bot</SelectItem>
            <SelectItem value="Nextbase Positions">Nextbase Positions</SelectItem>
            <SelectItem value="Pocket Transactions">Pocket Transactions</SelectItem>
            <SelectItem value="User Withdraws">User Withdraws</SelectItem>
            <SelectItem value="User Deposit">User Deposit</SelectItem>
            <SelectItem value="System Updates">System Updates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Activity description..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.status === "completed" && (
        <div>
          <Label htmlFor="date_ended">Date Ended</Label>
          <Input
            id="date_ended"
            type="date"
            value={formData.date_ended}
            onChange={(e) => setFormData(prev => ({ ...prev, date_ended: e.target.value }))}
          />
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {initialData ? 'Updating...' : 'Adding...'}
          </>
        ) : (
          initialData ? 'Update Activity' : 'Add Activity'
        )}
      </Button>
    </form>
  );
};

export default ActivityForm;
