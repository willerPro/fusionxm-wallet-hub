
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";

type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

const Withdraw = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get the wallet ID from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const walletId = queryParams.get("walletId");
    if (walletId) {
      setSelectedWalletId(walletId);
    }
  }, [location]);
  
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
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name, balance, currency')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setWallets(data as Wallet[]);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error loading wallets",
        description: "There was a problem loading your wallets.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedWalletId || !amount) return;
    
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedWallet && numericAmount > selectedWallet.balance) {
      toast({
        title: "Insufficient balance",
        description: "The amount exceeds your wallet balance.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // First, update the wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: (selectedWallet?.balance || 0) - numericAmount })
        .eq('id', selectedWalletId);
      
      if (updateError) throw updateError;
      
      // Then, create a transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: selectedWalletId,
          amount: numericAmount,
          type: 'withdrawal',
          status: 'completed',
          user_id: user.id // Add the user_id field
        });
      
      if (transactionError) throw transactionError;
      
      toast({
        title: "Withdrawal successful",
        description: `${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: selectedWallet?.currency || 'USD'
        }).format(numericAmount)} has been withdrawn from your wallet.`,
      });
      
      // Reset form
      setAmount("0");
      
      // Redirect to wallets page
      navigate('/wallets');
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error processing withdrawal",
        description: "There was a problem processing your withdrawal.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-semibold mb-6">Withdraw Funds</h2>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="wallet" className="text-sm font-medium">
                Select Wallet
              </label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger id="wallet">
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name} ({new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: wallet.currency
                      }).format(wallet.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedWallet && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-600">
                  Available balance: {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedWallet.currency
                  }).format(selectedWallet.balance)}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!selectedWalletId || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || isProcessing || (selectedWallet ? parseFloat(amount) > selectedWallet.balance : false)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Withdraw Funds"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdraw;
