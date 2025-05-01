
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletCard, { Wallet } from "@/components/wallet/WalletCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import WalletForm from "@/components/wallet/WalletForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

const Wallets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Check for authentication
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchWallets();
  }, [user, navigate]);

  // Fetch wallets from Supabase
  const fetchWallets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Wallet type
      const transformedWallets = data.map((wallet: any) => ({
        id: wallet.id,
        name: wallet.name,
        balance: Number(wallet.balance || 0),
        currency: wallet.currency,
      }));
      
      setWallets(transformedWallets);
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

  const handleCreateWallet = async (walletData: { name: string; currency: string }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert([{ 
          name: walletData.name, 
          currency: walletData.currency,
          balance: 0,
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newWallet: Wallet = {
          id: data[0].id,
          name: data[0].name,
          balance: Number(data[0].balance || 0),
          currency: data[0].currency,
        };
        
        setWallets([newWallet, ...wallets]);
        
        toast({
          title: "Wallet created",
          description: `${walletData.name} has been created successfully.`,
          duration: 3000,
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error creating wallet",
        description: "There was a problem creating your wallet.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
          <WalletForm onSubmit={handleCreateWallet} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallets;
