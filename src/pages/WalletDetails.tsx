
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, RefreshCw, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/types/wallet";
import { Transaction } from "@/types/activity";

const WalletDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchWalletDetails();
    fetchTransactions();
  }, [id, user, navigate]);
  
  const fetchWalletDetails = async () => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet details",
        variant: "destructive",
      });
      navigate('/wallets');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTransactions = async () => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Transform the data to match the Transaction type
      const transformedTransactions: Transaction[] = (data || []).map(tx => ({
        id: tx.id,
        amount: tx.amount,
        created_at: tx.created_at,
        status: tx.status,
        type: tx.type,
        user_id: tx.user_id,
        wallet_id: tx.wallet_id,
        transaction_type: tx.type, // Map 'type' to 'transaction_type'
        description: `${tx.type === 'deposit' ? 'Deposit to' : 'Withdrawal from'} wallet`
      }));
      
      setTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    }
  };
  
  const copyAddressToClipboard = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
        duration: 3000,
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }
  
  if (!wallet) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/wallets')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Wallets
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">Wallet not found</p>
              <Button onClick={() => navigate('/wallets')} className="mt-4">
                Return to My Wallets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getTransactionIcon = (transaction_type: string) => {
    switch (transaction_type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'withdraw':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="container mx-auto p-4 pb-20">
      <Button variant="ghost" onClick={() => navigate('/wallets')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Wallets
      </Button>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <img 
              src={`/icons/${wallet.currency?.toLowerCase()}.svg`} 
              alt={wallet.currency} 
              className="w-6 h-6 mr-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/icons/generic-crypto.svg";
              }}
            />
            {wallet.name || wallet.currency} Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-3xl font-bold">{wallet.balance} {wallet.currency}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <div className="flex items-center mt-1">
                <p className="text-sm font-mono bg-gray-100 p-2 rounded flex-1 overflow-hidden text-ellipsis">
                  {wallet.address}
                </p>
                <Button variant="ghost" size="sm" onClick={copyAddressToClipboard} className="ml-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                className="flex-1"
                onClick={() => navigate('/deposit', { state: { walletId: wallet.id } })}
              >
                <ArrowDown className="mr-2 h-4 w-4" /> Deposit
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/withdraw', { state: { walletId: wallet.id } })}
                variant="outline"
              >
                <ArrowUp className="mr-2 h-4 w-4" /> Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p>{wallet.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created On</p>
                <p>{new Date(wallet.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Network</p>
                <p>{wallet.network || "Main Network"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardContent className="pt-6">
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || transaction.transaction_type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}{transaction.amount} {wallet.currency}
                        </p>
                        <p className={`text-xs ${
                          transaction.status === 'completed' ? 'text-green-600' : 
                          transaction.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transaction history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletDetails;
