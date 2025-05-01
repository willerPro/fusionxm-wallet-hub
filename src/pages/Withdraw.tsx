
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

const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const preselectedWalletId = searchParams.get("walletId") || "";
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(preselectedWalletId);
  const [amount, setAmount] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
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
        if (transformedWallets.length > 0) {
          const initialWalletId = preselectedWalletId || transformedWallets[0].id;
          setSelectedWalletId(initialWalletId);
          
          const selectedWallet = transformedWallets.find(w => w.id === initialWalletId);
          setSelectedWallet(selectedWallet || null);
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
  }, [user, navigate, preselectedWalletId, toast]);

  // Update selected wallet when selection changes
  useEffect(() => {
    const wallet = wallets.find(w => w.id === selectedWalletId);
    setSelectedWallet(wallet || null);
  }, [selectedWalletId, wallets]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!selectedWalletId || !selectedWallet) {
      toast({
        title: "No wallet selected",
        description: "Please select a wallet for withdrawal.",
        variant: "destructive",
      });
      return;
    }
    
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (withdrawAmount > selectedWallet.balance) {
      toast({
        title: "Insufficient funds",
        description: "Your withdrawal amount exceeds your available balance.",
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
          amount: withdrawAmount,
          type: 'withdrawal',
          status: 'completed'
        }])
        .select();
      
      if (transactionError) throw transactionError;
      
      // Update wallet balance using the stored function
      const { data: updatedWallet, error: updateError } = await supabase
        .rpc('decrement_wallet_balance', {
          wallet_id_param: selectedWalletId,
          amount_param: withdrawAmount
        });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Withdrawal successful",
        description: `$${withdrawAmount.toFixed(2)} has been withdrawn from your wallet.`,
      });
      
      // Navigate back to wallets page
      navigate('/wallets');
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal. Please try again.",
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
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>
            Withdraw money from your investment wallet
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleWithdraw}>
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
                        {wallet.name} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
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
            
            {selectedWallet && (
              <>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium">Available Balance</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedWallet.currency }).format(selectedWallet.balance)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount</Label>
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
                      max={selectedWallet.balance.toString()}
                      step="0.01"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!selectedWalletId || !amount || isLoading || (selectedWallet && parseFloat(amount) > selectedWallet.balance)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw Funds'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Withdraw;
