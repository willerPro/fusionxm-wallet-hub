
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
import { ArrowLeft } from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Get wallets from localStorage
  useEffect(() => {
    const savedWallets = localStorage.getItem("wallets");
    if (savedWallets) {
      try {
        const parsedWallets = JSON.parse(savedWallets);
        setWallets(parsedWallets);
        
        // Check if walletId is provided in URL params
        const params = new URLSearchParams(location.search);
        const walletId = params.get("walletId");
        if (walletId) {
          setSelectedWalletId(walletId);
        } else if (parsedWallets.length > 0) {
          setSelectedWalletId(parsedWallets[0].id);
        }
      } catch (error) {
        console.error("Failed to parse wallets", error);
      }
    }
  }, [location.search]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWalletId || !amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid deposit",
        description: "Please select a wallet and enter a valid amount.",
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to process deposit
    setTimeout(() => {
      const updatedWallets = wallets.map((wallet) => {
        if (wallet.id === selectedWalletId) {
          return {
            ...wallet,
            balance: wallet.balance + parseFloat(amount),
          };
        }
        return wallet;
      });
      
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      
      // Add activity to history
      const selectedWallet = wallets.find(w => w.id === selectedWalletId);
      const activities = JSON.parse(localStorage.getItem("activities") || "[]");
      activities.unshift({
        id: Date.now().toString(),
        type: "deposit",
        amount: parseFloat(amount),
        description: `Deposit to ${selectedWallet?.name}`,
        date: new Date(),
      });
      localStorage.setItem("activities", JSON.stringify(activities));
      
      toast({
        title: "Deposit successful",
        description: `${amount} has been added to your wallet.`,
        duration: 3000,
      });
      
      setIsLoading(false);
      navigate("/wallets");
    }, 1000);
  };

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
              {isLoading ? "Processing..." : "Deposit Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;
