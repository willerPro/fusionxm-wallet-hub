import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState<string>("100");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchWallets();
  }, [user, navigate]);

  const fetchWallets = async () => {
    if (!user) return;
    
    try {
      setIsFetching(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform the data to match our Wallet type
        const transformedWallets = data.map((wallet: any) => ({
          id: wallet.id,
          name: wallet.name,
          balance: Number(wallet.balance || 0),
          currency: wallet.currency,
        }));
        
        setWallets(transformedWallets);
        
        // Set the first wallet as default selected
        if (data.length > 0 && !selectedWalletId) {
          setSelectedWalletId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error loading wallets",
        description: "There was a problem loading your wallets.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleDeposit = async () => {
    if (!user || !selectedWalletId || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid deposit",
        description: "Please select a wallet and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update wallet balance directly
      const numericAmount = parseFloat(amount);
      
      // Get current wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', selectedWalletId)
        .single();
        
      if (walletError) throw walletError;
      
      const currentBalance = Number(walletData.balance || 0);
      const newBalance = currentBalance + numericAmount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', selectedWalletId);
        
      if (updateError) throw updateError;
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          wallet_id: selectedWalletId,
          user_id: user.id,
          amount: numericAmount,
          type: 'deposit',
          status: 'completed'
        }]);
      
      if (transactionError) throw transactionError;
      
      toast({
        title: "Deposit successful",
        description: `You have deposited ${amount} to your wallet.`,
        duration: 3000,
      });
      
      // Navigate to wallets page
      navigate('/wallets');
    } catch (error) {
      console.error("Error making deposit:", error);
      toast({
        title: "Error making deposit",
        description: "There was a problem processing your deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Deposit Funds</CardTitle>
          <CardDescription>Add money to your investment wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wallets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">You don't have any wallets</p>
              <Button 
                onClick={() => navigate('/wallets')}
                className="bg-primary hover:bg-primary/90"
              >
                Create Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="wallet" className="text-sm font-medium">
                  Select Wallet
                </label>
                <Select 
                  value={selectedWalletId}
                  onValueChange={setSelectedWalletId}
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        {wallets.length > 0 && (
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleDeposit}
              disabled={isLoading || !selectedWalletId || parseFloat(amount || '0') <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Deposit Funds"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Deposit;
