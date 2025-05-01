
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Bot as LucideBot, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/types/bot";
import BotCard from "./BotCard";
import BotForm from "./BotForm";

const BotsSection = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [walletMap, setWalletMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBotType, setSelectedBotType] = useState<'binary' | 'nextbase' | 'contract' | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  
  useEffect(() => {
    const setupBots = async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      await fetchWallets();
      await fetchBots();
    };
    
    setupBots();
  }, []);
  
  const fetchBots = async () => {
    try {
      setIsLoading(true);
      
      // First check if the table exists to avoid errors
      const { data: checkTable, error: checkError } = await supabase
        .from('bots')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.code === 'PGRST204') {
        // Table doesn't exist yet
        console.log("Bots table doesn't exist yet");
        setBots([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('bots')
        .select('*');
      
      if (error) {
        console.error("Error fetching bots:", error);
        setBots([]);
      } else if (data) {
        setBots(data as Bot[]);
      } else {
        setBots([]);
      }
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast({
        title: "Error loading bots",
        description: "There was a problem loading your bots.",
        variant: "destructive",
      });
      setBots([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name, balance');
      
      if (error) throw error;
      
      const walletNameMap: Record<string, string> = {};
      let totalWalletBalance = 0;
      
      if (data) {
        data.forEach((wallet: { id: string; name: string; balance: number }) => {
          walletNameMap[wallet.id] = wallet.name;
          totalWalletBalance += parseFloat(wallet.balance?.toString() || '0');
        });
      }
      
      setWalletMap(walletNameMap);
      setTotalBalance(totalWalletBalance);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };
  
  const openBotDialog = (botType: 'binary' | 'nextbase' | 'contract') => {
    setSelectedBotType(botType);
    setDialogOpen(true);
  };
  
  const handleBotCreated = () => {
    setDialogOpen(false);
    fetchBots();
    fetchWallets();
  };
  
  const isFunded = totalBalance > 0;
  
  const botTypes = [
    { 
      type: 'binary', 
      name: 'Binary Trading (Pocket Option)', 
      description: 'Automated binary options trading bot',
      requiresFunds: 500
    },
    { 
      type: 'nextbase', 
      name: 'Nextbase Bot', 
      description: 'Neural network trading algorithm',
      requiresFunds: 3000
    },
    { 
      type: 'contract', 
      name: 'Contract Bot', 
      description: 'Smart contract execution bot',
      requiresFunds: 2600
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {botTypes.map((bot) => (
          <Card key={bot.type} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <LucideBot className="h-6 w-6 text-primary" />
                  </div>
                  <Button
                    variant={totalBalance >= bot.requiresFunds ? "default" : "outline"}
                    size="sm"
                    onClick={() => openBotDialog(bot.type as 'binary' | 'nextbase' | 'contract')}
                    disabled={totalBalance < bot.requiresFunds}
                  >
                    {totalBalance >= bot.requiresFunds ? 'Enable' : 'Disabled'}
                  </Button>
                </div>
                <h3 className="text-lg font-semibold mb-1">{bot.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{bot.description}</p>
                
                {totalBalance < bot.requiresFunds && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Requires ${bot.requiresFunds} minimum funds</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {!isFunded && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
          <div className="flex gap-2 items-center mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">No funds available</h3>
          </div>
          <p className="text-sm">
            You need to fund your wallet before you can use any trading bots. 
            Visit the Wallets page to create a wallet and deposit funds.
          </p>
        </div>
      )}
      
      {bots.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Your Active Bots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} walletName={walletMap[bot.wallet_id]} />
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBotType && `Configure ${
                selectedBotType === 'binary'
                  ? 'Binary Trading Bot'
                  : selectedBotType === 'nextbase'
                  ? 'Nextbase Bot'
                  : 'Contract Bot'
              }`}
            </DialogTitle>
          </DialogHeader>
          {selectedBotType && (
            <BotForm
              botType={selectedBotType}
              onSuccess={handleBotCreated}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BotsSection;
