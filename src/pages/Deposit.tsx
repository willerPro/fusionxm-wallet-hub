
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "@/components/wallet/WalletCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";

const Deposit = () => {
  const [searchParams] = useSearchParams();
  const preselectedWalletId = searchParams.get("walletId") || "";
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(preselectedWalletId);
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingWallets, setIsFetchingWallets] = useState<boolean>(true);

  // Fetch wallets from Supabase
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchWallets = async () => {
      try {
        setIsFetchingWallets(true);
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to match our Wallet type
        const transformedWallets = data.map((wallet: any) => ({
          id: wallet.id,
          name: wallet.name,
          balance: parseFloat(wallet.balance || 0),
          currency: wallet.currency,
        }));
        
        setWallets(transformedWallets);
        
        // If we have wallets but no selection, select the first one
        if (transformedWallets.length > 0 && !selectedWalletId) {
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
        setIsFetchingWallets(false);
      }
    };

    fetchWallets();
  }, [user, navigate, selectedWalletId, toast]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!selectedWalletId) {
      toast({
        title: "No wallet selected",
        description: "Please select a wallet for deposit.",
        variant: "destructive",
      });
      return;
    }
    
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          wallet_id: selectedWalletId,
          user_id: user.id,
          amount: depositAmount,
          type: 'deposit',
          status: 'completed'
        }])
        .select();
      
      if (transactionError) throw transactionError;
      
      // Update wallet balance using the stored function
      const { data: updatedWallet, error: updateError } = await supabase
        .rpc('increment_wallet_balance', {
          wallet_id_param: selectedWalletId,
          amount_param: depositAmount
        });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Deposit successful",
        description: `$${depositAmount.toFixed(2)} has been added to your wallet.`,
      });
      
      // Navigate back to wallets page
      navigate('/wallets');
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast({
        title: "Deposit failed",
        description: "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingWallets) {
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
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Add money to your investment wallet
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleDeposit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Select Wallet</Label>
              {wallets.length > 0 ? (
                <Select 
                  value={selectedWalletId} 
                  onValueChange={setSelectedWalletId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="wallet">
                    <SelectValue placeholder="Select a wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">You don't have any wallets yet</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/wallets')}
                  >
                    Create a Wallet
                  </Button>
                </div>
              )}
            </div>
            
            {wallets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.01"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!selectedWalletId || !amount || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Deposit Funds'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Deposit;
