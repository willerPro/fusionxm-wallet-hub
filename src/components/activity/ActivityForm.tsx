
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

interface ActivityFormProps {
  onSubmit: (data: {
    activity_type: string;
    description: string;
    status: string;
    wallet_id?: string;
    name: string;
    type: string;
    amount?: number;
  }) => void;
  isLoading: boolean;
  initialData?: {
    activity_type: string;
    description: string | null;
    status: string;
    wallet_id?: string | null;
    name: string;
    type: string;
    amount: number;
  } | null;
}

const ActivityForm = ({ onSubmit, isLoading, initialData }: ActivityFormProps) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    activity_type: "",
    description: "",
    status: "active",
    wallet_id: "",
    name: "",
    type: "activity",
    amount: 0,
  });

  useEffect(() => {
    fetchWallets();
  }, [user]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        activity_type: initialData.activity_type,
        description: initialData.description || "",
        status: initialData.status,
        wallet_id: initialData.wallet_id || "",
        name: initialData.name,
        type: initialData.type,
        amount: initialData.amount,
      });
    }
  }, [initialData]);

  const fetchWallets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      activity_type: formData.activity_type,
      description: formData.description,
      status: formData.status,
      wallet_id: formData.wallet_id || undefined,
      name: formData.name,
      type: formData.type,
      amount: formData.amount,
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
          <Label htmlFor="wallet">Wallet</Label>
          <Select value={formData.wallet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, wallet_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="name">Activity Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Activity name..."
            required
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>
      </div>

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
