
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [isFetching, setIsFetching] = useState(true);

  const networks = [
    { value: "bitcoin", label: "Bitcoin (BTC)" },
    { value: "ethereum", label: "Ethereum (ETH)" },
    { value: "tron", label: "Tron (TRX)" },
    { value: "usdt-trc20", label: "USDT (TRC20)" },
    { value: "usdt-erc20", label: "USDT (ERC20)" },
    { value: "bnb", label: "BNB Smart Chain" },
  ];

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const transformedWallets = data.map((wallet: any) => ({
          id: wallet.id,
          name: wallet.name,
          balance: Number(wallet.balance || 0),
          currency: wallet.currency,
        }));
        
        setWallets(transformedWallets);
        
        if (data.length > 0 && !selectedWalletId) {
          setSelectedWalletId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Deposit Setup</CardTitle>
          <CardDescription>Configure your deposit details</CardDescription>
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
                <label htmlFor="address" className="text-sm font-medium">
                  Wallet Address
                </label>
                <Input
                  id="address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="network" className="text-sm font-medium">
                  Choose Network
                </label>
                <Select 
                  value={selectedNetwork}
                  onValueChange={setSelectedNetwork}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert className="bg-amber-50 border-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Please note:</strong> Deposits might be delayed due to transaction processing times. 
                  Processing can take anywhere from a few minutes to several hours depending on network congestion.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;
