import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/types/wallet";

const WITHDRAWAL_FEE = 4; // Fixed $4 fee

const Withdraw = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [network, setNetwork] = useState<string>("ERC20");
  const [amount, setAmount] = useState<string>("0");
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setWallets(data as Wallet[]);
      
      // Calculate total balance across all wallets
      const total = data.reduce((sum: number, wallet: Wallet) => sum + (wallet.balance || 0), 0);
      setTotalBalance(total);
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
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !walletAddress || !amount || !network) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const numericAmount = parseFloat(amount);
    const totalWithFee = numericAmount + WITHDRAWAL_FEE;
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (totalWithFee > totalBalance) {
      toast({
        title: "Insufficient balance",
        description: "The amount plus fee exceeds your total balance across all wallets.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallets[0]?.id, // Use first wallet as reference
          amount: numericAmount,
          type: 'withdrawal',
          status: 'completed',
          user_id: user.id,
          description: `Withdrawal to ${walletAddress} via ${network} network`
        });
      
      if (transactionError) throw transactionError;
      
      // Create a fee transaction record
      const { error: feeTransactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallets[0]?.id, // Use first wallet as reference
          amount: WITHDRAWAL_FEE,
          type: 'fee',
          status: 'completed',
          user_id: user.id,
          description: `Fee for withdrawal to ${walletAddress}`
        });
      
      if (feeTransactionError) throw feeTransactionError;
      
      // Update wallet balances to reflect the withdrawal
      // First, try to take from first wallet
      let remainingAmount = totalWithFee;
      const updatedWallets = [...wallets];
      
      for (let i = 0; i < updatedWallets.length; i++) {
        if (remainingAmount <= 0) break;
        
        const wallet = updatedWallets[i];
        const amountToDeduct = Math.min(wallet.balance, remainingAmount);
        
        if (amountToDeduct > 0) {
          // Update wallet balance in the database
          const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: wallet.balance - amountToDeduct })
            .eq('id', wallet.id);
            
          if (updateError) throw updateError;
          
          remainingAmount -= amountToDeduct;
        }
      }
      
      toast({
        title: "Withdrawal successful",
        description: `${numericAmount.toFixed(2)} has been withdrawn to ${walletAddress} (${network}). Fee: $${WITHDRAWAL_FEE.toFixed(2)}`,
      });
      
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
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter destination wallet address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Network</Label>
              <RadioGroup value={network} onValueChange={setNetwork} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ERC20" id="erc20" />
                  <Label htmlFor="erc20">ERC20 (Ethereum)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TRC20" id="trc20" />
                  <Label htmlFor="trc20">TRC20 (Tron)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BEP20" id="bep20" />
                  <Label htmlFor="bep20">BEP20 (Binance Smart Chain)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-600 font-medium">
                Total balance across all wallets: ${totalBalance.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                required
              />
            </div>
            
            {parseFloat(amount) > 0 && (
              <div className="p-3 bg-amber-50 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>${parseFloat(amount || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fee:</span>
                  <span>${WITHDRAWAL_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-amber-200">
                  <span>Total:</span>
                  <span>${(parseFloat(amount || "0") + WITHDRAWAL_FEE).toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!walletAddress || !network || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || isProcessing || (parseFloat(amount) + WITHDRAWAL_FEE > totalBalance)}
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
