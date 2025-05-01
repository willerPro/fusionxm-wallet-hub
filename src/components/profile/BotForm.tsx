
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Wallet } from "@/components/wallet/WalletCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BotFormData } from "@/types/bot";

interface BotFormProps {
  botType: 'binary' | 'nextbase' | 'contract';
  onSuccess: () => void;
  onCancel: () => void;
}

const BotForm = ({ botType, onSuccess, onCancel }: BotFormProps) => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BotFormData>({
    wallet_id: '',
    bot_type: botType,
    duration: 30,
    profit_target: 25,
    amount: 100
  });
  
  useEffect(() => {
    fetchWallets();
  }, []);
  
  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Wallet type
      const transformedWallets = data.map((wallet: any) => ({
        id: wallet.id,
        name: wallet.name,
        balance: parseFloat(wallet.balance || 0),
        currency: wallet.currency,
        passwordProtected: wallet.password_protected || false
      }));
      
      setWallets(transformedWallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error loading wallets",
        description: "There was a problem loading your wallets.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof BotFormData, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const selectedWallet = wallets.find(w => w.id === formData.wallet_id);
      
      if (!selectedWallet) {
        throw new Error("Please select a wallet");
      }
      
      if (selectedWallet.balance < formData.amount) {
        throw new Error("Insufficient wallet balance");
      }

      // Call the Supabase function to create a bot
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.rpc('create_bot', {
        user_id_param: user.user.id,
        wallet_id_param: formData.wallet_id,
        bot_type_param: formData.bot_type,
        duration_param: formData.duration,
        profit_target_param: formData.profit_target,
        amount_param: formData.amount
      });
      
      if (error) throw error;
      
      toast({
        title: "Bot started successfully",
        description: `Your ${getBotTypeLabel(formData.bot_type)} has been started.`,
        duration: 3000,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error starting bot:", error);
      toast({
        title: "Error starting bot",
        description: error.message || "There was a problem starting your bot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBotTypeLabel = (type: string) => {
    switch(type) {
      case 'binary': return 'Binary Trading (Pocket Option)';
      case 'nextbase': return 'Nextbase Bot';
      case 'contract': return 'Contract Bot';
      default: return type;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="wallet" className="text-sm font-medium">
          Select Wallet
        </label>
        <Select 
          value={formData.wallet_id}
          onValueChange={(value) => handleChange('wallet_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name} ({wallet.balance.toFixed(2)} {wallet.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Amount
        </label>
        <Input
          id="amount"
          type="number"
          min="10"
          step="10"
          value={formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="duration" className="text-sm font-medium">
          Duration (days)
        </label>
        <Select 
          value={formData.duration.toString()}
          onValueChange={(value) => handleChange('duration', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="profit" className="text-sm font-medium">
          Profit Target (%)
        </label>
        <Select 
          value={formData.profit_target.toString()}
          onValueChange={(value) => handleChange('profit_target', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10%</SelectItem>
            <SelectItem value="25">25%</SelectItem>
            <SelectItem value="40">40%</SelectItem>
            <SelectItem value="60">60%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="w-1/2">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="w-1/2">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Start Bot
        </Button>
      </div>
    </form>
  );
};

export default BotForm;
