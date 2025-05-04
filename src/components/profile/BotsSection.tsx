
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/types/bot";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BotCard from "./BotCard";
import BotForm from "./BotForm";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/types/wallet";

const BotsSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBots();
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*");

      if (error) throw error;

      setWallets(data as Wallet[]);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error loading wallets",
        description: "There was a problem loading your wallets.",
        variant: "destructive",
      });
    }
  };

  const fetchBots = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc("get_user_bots");

      if (error) throw error;

      setBots(data || []);
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast({
        title: "Error loading bots",
        description: "There was a problem loading your bots.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBot = async (botData: {
    walletId: string;
    botType: "binary" | "nextbase" | "contract";
    duration: number;
    profitTarget: number;
    amount: number;
  }) => {
    if (!user) return;

    setIsCreating(true);

    try {
      const { error } = await supabase.rpc("create_bot", {
        user_id_param: user.id,
        wallet_id_param: botData.walletId,
        bot_type_param: botData.botType,
        duration_param: botData.duration,
        profit_target_param: botData.profitTarget,
        amount_param: botData.amount,
      });

      if (error) throw error;

      toast({
        title: "Bot created",
        description: "Your bot has been created successfully.",
        duration: 3000,
      });

      await fetchBots(); // Refresh the bots list
      setIsDialogOpen(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Bots</h2>
        {wallets.length > 0 && (
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> New Bot
          </Button>
        )}
      </div>

      {wallets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">You need to create a wallet before creating bots.</p>
            <Button asChild>
              <a href="/wallets">Create Wallet</a>
            </Button>
          </CardContent>
        </Card>
      ) : bots.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">You don't have any bots yet</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onBotUpdate={fetchBots} />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bot</DialogTitle>
            <DialogDescription>Configure your trading bot</DialogDescription>
          </DialogHeader>
          <BotForm onSubmit={handleCreateBot} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BotsSection;
