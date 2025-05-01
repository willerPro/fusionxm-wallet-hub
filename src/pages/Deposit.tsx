
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "@/components/wallet/WalletCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

const Deposit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  
  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);
  
  // Get wallets from Supabase
  useEffect(() => {
    const fetchWallets = async () => {
      if (!session) return;
      
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
          balance: parseFloat(wallet.balance),
          currency: wallet.currency,
        }));
        
        setWallets(transformedWallets);
        
        // Check if walletId is provided in URL params
        const params = new URLSearchParams(location.search);
        const walletId = params.get("walletId");
        if (walletId) {
          setSelectedWalletId(walletId);
        } else if (transformedWallets.length > 0) {
          setSelectedWalletId(transformedWallets[0].id);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
        toast({
          title: "Error loading wallets",
          description: "There was a problem loading your wallets.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingWallets(false);
      }
    };

    fetchWallets();
  }, [session, location.search, toast]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !selectedWalletId || !amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid deposit",
        description: "Please select a wallet and enter a valid amount.",
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Use transaction to ensure both operations succeed or fail together
    try {
      // First create a transaction record
      const depositAmount = parseFloat(amount);
      
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: selectedWalletId,
          user_id: session.user.id,
          amount: depositAmount,
          type: 'deposit'
        })
        .select();
      
      if (transactionError) throw transactionError;
      
      // Then update the wallet balance
      const { error: updateError } = await supabase
        .rpc('increment_wallet_balance', {
          wallet_id_param: selectedWalletId,
          amount_param: depositAmount
        });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Deposit successful",
        description: `${amount} has been added to your wallet.`,
        duration: 3000,
      });
      
      navigate("/wallets");
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit failed",
        description: error.message || "There was a problem processing your deposit.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingWallets) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate("/wallets")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Wallets
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Deposit Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="wallet" className="text-sm font-medium">
                Select Wallet
              </label>
              <Select 
                value={selectedWalletId} 
                onValueChange={setSelectedWalletId}
                disabled={wallets.length === 0}
              >
                <SelectTrigger id="wallet">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name} ({wallet.currency})
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
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Deposit Funds"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;
