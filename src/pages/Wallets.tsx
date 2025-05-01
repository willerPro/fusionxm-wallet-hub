
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletCard, { Wallet } from "@/components/wallet/WalletCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import WalletForm from "@/components/wallet/WalletForm";
import { useToast } from "@/components/ui/use-toast";

const Wallets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate loading wallets from localStorage
    const savedWallets = localStorage.getItem("wallets");
    if (savedWallets) {
      try {
        setWallets(JSON.parse(savedWallets));
      } catch (error) {
        console.error("Failed to parse wallets", error);
      }
    } else {
      // Set initial demo wallets if none exist
      const initialWallets: Wallet[] = [
        {
          id: "1",
          name: "Investment Wallet",
          balance: 10000,
          currency: "USD",
        },
        {
          id: "2",
          name: "Savings Wallet",
          balance: 5000,
          currency: "USD",
        },
      ];
      setWallets(initialWallets);
      localStorage.setItem("wallets", JSON.stringify(initialWallets));
    }
  }, []);

  const handleCreateWallet = (walletData: { name: string; currency: string }) => {
    setIsLoading(true);
    
    // Simulate API call to create wallet
    setTimeout(() => {
      const newWallet: Wallet = {
        id: Date.now().toString(),
        name: walletData.name,
        balance: 0,
        currency: walletData.currency,
      };
      
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      
      toast({
        title: "Wallet created",
        description: `${walletData.name} has been created successfully.`,
        duration: 3000,
      });
      
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Wallets</h2>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Wallet
        </Button>
      </div>

      <div className="space-y-4">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You don't have any wallets yet</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Create Your First Wallet
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Wallet</DialogTitle>
            <DialogDescription>
              Add a new wallet to manage your investments
            </DialogDescription>
          </DialogHeader>
          <WalletForm onSubmit={handleCreateWallet} isLoading={isLoading} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallets;
