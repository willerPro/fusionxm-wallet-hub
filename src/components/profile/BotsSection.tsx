
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Bot, BotType } from "@/types/bot";
import BotForm from "./BotForm";
import BotCard from "./BotCard";
import { PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import type { Database } from "@/types/supabase"; // Import the updated Database type

type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

const BotsSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBots();
      fetchWallets();
    }
  }, [user]);

  const fetchBots = async () => {
    try {
      setIsLoading(true);
      // Use RPC function to get user bots safely
      const { data, error } = await supabase.rpc('get_user_bots');
      
      if (error) throw error;
      
      if (data) {
        // The data is already an array of bots in the correct format
        setBots(data as Bot[]);
      } else {
        setBots([]);
      }
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast({
        title: "Error loading bots",
        description: "There was a problem loading your trading bots.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name, balance, currency');
      
      if (error) throw error;
      
      setWallets(data as Wallet[]);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const handleCreateBot = async (botData: {
    walletId: string;
    botType: BotType;
    duration: number;
    profitTarget: number;
    amount: number;
  }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      // Use RPC function to create the bot and update wallet balance
      const { data, error } = await supabase.rpc('create_bot', {
        user_id_param: user.id,
        wallet_id_param: botData.walletId,
        bot_type_param: botData.botType,
        duration_param: botData.duration,
        profit_target_param: botData.profitTarget,
        amount_param: botData.amount
      });
      
      if (error) throw error;
      
      toast({
        title: "Bot created",
        description: `Your ${botData.botType} trading bot has been created successfully.`,
      });
      
      setIsDialogOpen(false);
      
      // Refresh the bots and wallets data
      fetchBots();
      fetchWallets();
    } catch (error: any) {
      console.error("Error creating bot:", error);
      toast({
        title: "Error creating bot",
        description: error.message || "There was a problem creating your bot.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Trading Bots</h2>
        <Button 
          variant="default"
          onClick={() => setIsDialogOpen(true)}
          disabled={wallets.length === 0}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Bot
        </Button>
      </div>

      {wallets.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-6">
          <p className="text-yellow-700">
            You need to create a wallet before you can create a trading bot. Go to the Wallets page to create one.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {bots.length > 0 ? (
          bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))
        ) : (
          <div className="text-center py-10 border rounded-lg bg-slate-50">
            <p className="text-gray-500 mb-4">You don't have any trading bots yet</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              disabled={wallets.length === 0}
            >
              Create Your First Bot
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Trading Bot</DialogTitle>
          </DialogHeader>
          <BotForm onSubmit={handleCreateBot} isLoading={isCreating} wallets={wallets} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BotsSection;
