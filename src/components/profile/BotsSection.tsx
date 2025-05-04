
import React, { useState, useEffect } from "react";
import BotCard from "./BotCard";
import BotForm from "./BotForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot } from "@/types/bot";

const BotsSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch bots on component mount
  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_user_bots', {});
      
      if (error) {
        console.error("Error fetching bots:", error);
        setError("Failed to load bots. Please try again later.");
        return;
      }
      
      console.log("Fetched bots:", data);
      setBots(data || []);
    } catch (err: any) {
      console.error("Exception fetching bots:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (botData: {
    walletId: string;
    botType: 'binary' | 'nextbase' | 'contract';
    duration: number;
    profitTarget: number;
    amount: number;
  }) => {
    try {
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a bot.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const { data, error } = await supabase.rpc('create_bot', {
        user_id_param: userData.user.id,
        wallet_id_param: botData.walletId,
        bot_type_param: botData.botType,
        duration_param: botData.duration,
        profit_target_param: botData.profitTarget,
        amount_param: botData.amount
      });

      if (error) {
        console.error("Error creating bot:", error);
        toast({
          title: "Failed to Create Bot",
          description: error.message || "Please try again later.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      toast({
        title: "Bot Created",
        description: "Your trading bot has been successfully created.",
        duration: 3000,
      });

      setShowForm(false);
      fetchBots(); // Refresh the bots list
    } catch (err: any) {
      console.error("Exception creating bot:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trading Bots</h3>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="text-primary hover:underline text-sm"
        >
          {showForm ? "Cancel" : "Create Bot"}
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && <BotForm onSubmit={handleCreateBot} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading bots...</p>
      ) : bots.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onBotUpdate={fetchBots} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">You haven't created any trading bots yet.</p>
      )}
    </div>
  );
};

export default BotsSection;
