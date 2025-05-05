
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/types/wallet";
import { CryptoTransaction } from "@/types/activity";
import { AlertCircle, Copy, CheckCircle, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const TRON_ADDRESS = "TY7V4VBvvharEHT5Ww1xzJtWfztDYQhRUc";

const CryptoTransactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"receive" | "send">("receive");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [coinType, setCoinType] = useState<"USDT" | "TRX">("USDT");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchWallets();
    fetchTransactions();
  }, [user, navigate]);

  const fetchWallets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      const walletsData = data.map((wallet: any) => ({
        id: wallet.id,
        name: wallet.name,
        balance: parseFloat(wallet.balance || 0),
        currency: wallet.currency,
        passwordProtected: wallet.password_protected || false
      })) as Wallet[];
      
      setWallets(walletsData);
      if (walletsData.length > 0) {
        setSelectedWalletId(walletsData[0].id);
      }
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

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("crypto_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setTransactions(data as CryptoTransaction[]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(TRON_ADDRESS);
    setHasCopied(true);
    toast({
      title: "Address Copied",
      description: "TRC20 address has been copied to clipboard.",
    });
    
    setTimeout(() => setHasCopied(false), 3000);
  };

  const handleSend = async () => {
    if (!user || !selectedWalletId || !amount || !address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    if (selectedWallet && numericAmount > selectedWallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "The amount exceeds your wallet balance.",
        variant: "destructive",
      });
      return;
    }

    // Check if wallet is password protected
    if (selectedWallet?.passwordProtected) {
      // Open password dialog
      setPendingTransaction({
        wallet_id: selectedWalletId,
        type: "send",
        coin_type: coinType,
        amount: numericAmount,
        address: address
      });
      setIsPasswordDialogOpen(true);
    } else {
      // Process transaction without password
      await createTransaction({
        wallet_id: selectedWalletId,
        type: "send",
        coin_type: coinType,
        amount: numericAmount,
        address: address,
        password_verified: true
      });
    }
  };

  const handlePasswordConfirmation = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would verify the password here
      // For this example, we'll just accept any non-empty password
      if (!password) {
        toast({
          title: "Password Required",
          description: "Please enter your wallet password.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      await createTransaction({
        ...pendingTransaction,
        password_verified: true
      });
      
      setIsPasswordDialogOpen(false);
      setPassword("");
      setPendingTransaction(null);
    } catch (error) {
      console.error("Error processing transaction:", error);
      toast({
        title: "Transaction Failed",
        description: "There was a problem processing your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createTransaction = async (transactionData: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // First insert the transaction record
      const { data, error } = await supabase
        .from("crypto_transactions")
        .insert({
          ...transactionData,
          user_id: user.id,
          status: "pending"
        })
        .select("*");
      
      if (error) throw error;
      
      // For send transactions, update wallet balance
      if (transactionData.type === "send") {
        const { error: updateError } = await supabase
          .from("wallets")
          .update({ 
            balance: supabase.rpc('decrement_balance', { 
              amount: transactionData.amount,
              wallet_id: transactionData.wallet_id
            })
          })
          .eq("id", transactionData.wallet_id);
        
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Transaction Created",
        description: `Your ${transactionData.type} transaction has been created.`,
      });
      
      // Reset form
      setAmount("");
      setAddress("");
      
      // Refresh transactions
      fetchTransactions();
      fetchWallets();
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "There was a problem creating your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceive = async () => {
    if (!user || !selectedWalletId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    await createTransaction({
      wallet_id: selectedWalletId,
      type: "receive",
      coin_type: coinType,
      amount: numericAmount,
      address: TRON_ADDRESS
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "receive" | "send")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="receive">Receive</TabsTrigger>
              <TabsTrigger value="send">Send</TabsTrigger>
            </TabsList>
            
            <TabsContent value="receive">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-md flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Your TRC20 Address</p>
                    <p className="text-xs text-gray-500 mt-1">For USDT and TRX</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono">{TRON_ADDRESS.slice(0, 8)}...{TRON_ADDRESS.slice(-8)}</p>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={copyAddressToClipboard}
                    >
                      {hasCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Wallet</Label>
                  <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.currency} {wallet.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Coin Type</Label>
                  <Select value={coinType} onValueChange={(value) => setCoinType(value as "USDT" | "TRX")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT (TRC20)</SelectItem>
                      <SelectItem value="TRX">TRX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    This is a mock transaction. In a real application, you would receive notifications when crypto arrives at your address.
                  </p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleReceive}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 mr-2" />
                  )}
                  Record Received Amount
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="send">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Wallet</Label>
                  <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.currency} {wallet.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Coin Type</Label>
                  <Select value={coinType} onValueChange={(value) => setCoinType(value as "USDT" | "TRX")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT (TRC20)</SelectItem>
                      <SelectItem value="TRX">TRX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Recipient Address</Label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="TRC20 Wallet Address"
                  />
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    This is a mock transaction. In a real application, your crypto would be sent to the specified address.
                  </p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleSend}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 border rounded-md flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      {transaction.type === "send" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium">
                        {transaction.type === "send" ? "Sent" : "Received"} {transaction.coin_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-xs font-mono text-gray-500 mt-1">
                      {transaction.address.slice(0, 8)}...{transaction.address.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={transaction.type === "send" ? "text-red-600" : "text-green-600"}>
                      {transaction.type === "send" ? "-" : "+"}{transaction.amount}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">No transactions yet</p>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet Password Required</DialogTitle>
            <DialogDescription>
              This wallet is password protected. Please enter your password to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPasswordDialogOpen(false);
              setPassword("");
              setPendingTransaction(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordConfirmation} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CryptoTransactions;
