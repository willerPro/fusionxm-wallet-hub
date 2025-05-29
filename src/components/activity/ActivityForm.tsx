
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
    current_profit?: number;
    amount_in_use?: number;
    server_space_taken?: number;
    next_update_set?: string;
  }) => void;
  isLoading: boolean;
  initialData?: {
    activity_type: string;
    description: string | null;
    status: string;
    date_ended: string | null;
    current_profit: number | null;
    amount_in_use: number | null;
    server_space_taken: number | null;
    next_update_set: string | null;
  } | null;
}

const ActivityForm = ({ onSubmit, isLoading, initialData }: ActivityFormProps) => {
  const [formData, setFormData] = useState({
    activity_type: "",
    description: "",
    status: "active",
    date_ended: "",
    current_profit: 0,
    amount_in_use: 0,
    server_space_taken: 0,
    next_update_set: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        activity_type: initialData.activity_type,
        description: initialData.description || "",
        status: initialData.status,
        date_ended: initialData.date_ended ? initialData.date_ended.split('T')[0] : "",
        current_profit: initialData.current_profit || 0,
        amount_in_use: initialData.amount_in_use || 0,
        server_space_taken: initialData.server_space_taken || 0,
        next_update_set: initialData.next_update_set ? initialData.next_update_set.split('T')[0] : "",
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
      current_profit: formData.current_profit,
      amount_in_use: formData.amount_in_use,
      server_space_taken: formData.server_space_taken,
      next_update_set: formData.next_update_set || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="current_profit">Current Profit ($)</Label>
          <Input
            id="current_profit"
            type="number"
            step="0.01"
            value={formData.current_profit}
            onChange={(e) => setFormData(prev => ({ ...prev, current_profit: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="amount_in_use">Amount in Use ($)</Label>
          <Input
            id="amount_in_use"
            type="number"
            step="0.01"
            value={formData.amount_in_use}
            onChange={(e) => setFormData(prev => ({ ...prev, amount_in_use: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="server_space_taken">Server Space Taken (MB)</Label>
          <Input
            id="server_space_taken"
            type="number"
            step="0.1"
            value={formData.server_space_taken}
            onChange={(e) => setFormData(prev => ({ ...prev, server_space_taken: parseFloat(e.target.value) || 0 }))}
            placeholder="0.0"
          />
        </div>

        <div>
          <Label htmlFor="next_update_set">Next Update Set</Label>
          <Input
            id="next_update_set"
            type="date"
            value={formData.next_update_set}
            onChange={(e) => setFormData(prev => ({ ...prev, next_update_set: e.target.value }))}
          />
        </div>
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
