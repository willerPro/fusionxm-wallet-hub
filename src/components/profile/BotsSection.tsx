
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Bot, BotType } from '@/types/bot';
import { Wallet } from '@/types/wallet';
import { useAuth } from '@/components/auth/AuthContext';
import BotCard from './BotCard';
import BotForm from './BotForm';
import { Loader2 } from 'lucide-react';

const BotsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-bots');
  const [isCreatingBot, setIsCreatingBot] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBots();
      fetchWallets();
    }
  }, [user]);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      // Transform data to match Wallet interface
      const walletsData = data.map((wallet: any) => ({
        id: wallet.id,
        name: wallet.name,
        balance: parseFloat(wallet.balance || 0),
        currency: wallet.currency,
        passwordProtected: wallet.password_protected || false
      })) as Wallet[];

      setWallets(walletsData);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const fetchBots = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to match Bot interface if needed
      const botsData = data.map((bot: any) => ({
        id: bot.id,
        user_id: bot.user_id,
        wallet_id: bot.wallet_id,
        bot_type: bot.bot_type as BotType,
        duration: bot.duration,
        profit_target: bot.profit_target,
        profit: bot.profit,
        status: bot.status,
        name: bot.name,
        type: bot.type,
        created_at: bot.created_at,
        updated_at: bot.updated_at
      }));

      setBots(botsData);
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast({
        title: "Error",
        description: "Failed to load your bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBot = async (botData: {
    walletId: string;
    botType: BotType;
    duration: number;
    profitTarget: number;
    name: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from("bots").insert([
        {
          user_id: user.id,
          wallet_id: botData.walletId,
          bot_type: botData.botType,
          duration: botData.duration,
          profit_target: botData.profitTarget,
          name: botData.name,
          type: "automated",
          status: "active",
        },
      ]).select();

      if (error) throw error;

      toast({
        title: "Bot Created",
        description: "Your bot has been created and is now running.",
      });

      setIsCreatingBot(false);
      fetchBots();
    } catch (error) {
      console.error("Error creating bot:", error);
      toast({
        title: "Error",
        description: "Failed to create bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="my-bots">My Bots</TabsTrigger>
              <TabsTrigger value="bot-history">History</TabsTrigger>
            </TabsList>
            {!isCreatingBot && (
              <Button onClick={() => setIsCreatingBot(true)}>Create Bot</Button>
            )}
          </div>

          {isCreatingBot ? (
            <BotForm
              onSubmit={handleCreateBot}
              onCancel={() => setIsCreatingBot(false)}
            />
          ) : (
            <>
              <TabsContent value="my-bots">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bots.length > 0 ? (
                  <div className="grid gap-4">
                    {bots.map((bot) => (
                      <BotCard key={bot.id} bot={bot} onBotUpdate={fetchBots} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You don't have any active bots yet.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bot-history">
                <div className="text-center py-8 text-gray-500">
                  Bot history will be available soon.
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BotsSection;
