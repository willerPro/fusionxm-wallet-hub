
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/types/wallet";
import { CryptoTransaction } from "@/types/activity";
import { Loader2 } from "lucide-react";
import CryptoDeposit from "@/components/crypto/CryptoDeposit";
import CryptoWithdraw from "@/components/crypto/CryptoWithdraw";
import TransactionHistory from "@/components/crypto/TransactionHistory";

const CryptoTransactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Fetch wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id);
      
      if (walletsError) throw walletsError;
      
      const formattedWallets = walletsData.map((wallet: any) => ({
        id: wallet.id,
        name: wallet.name,
        balance: parseFloat(wallet.balance || 0),
        currency: wallet.currency,
        passwordProtected: wallet.password_protected || false
      })) as Wallet[];
      
      setWallets(formattedWallets);
      
      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("crypto_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (txError) throw txError;
      
      setTransactions(txData as CryptoTransaction[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading your data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    <div className="container mx-auto p-4 max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">Crypto Transactions</h2>
      
      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "deposit" | "withdraw")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <CryptoDeposit 
              wallets={wallets} 
              onSuccess={fetchData} 
            />
          </TabsContent>
          
          <TabsContent value="withdraw">
            <CryptoWithdraw 
              wallets={wallets} 
              onSuccess={fetchData} 
            />
          </TabsContent>
        </Tabs>
      </Card>
      
      <TransactionHistory transactions={transactions} />
    </div>
  );
};

export default CryptoTransactions;
