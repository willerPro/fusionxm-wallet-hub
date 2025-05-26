import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/wallet/WalletCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Wallet as WalletIcon } from "lucide-react";
import WalletForm from "@/components/wallet/WalletForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/types/wallet";

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
        passwordProtected: wallet.password_protected || false
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

  const handleCreateWallet = async (walletData: { 
    name: string; 
    currency: string;
    password?: string;
    passwordProtected: boolean;
    backupKey?: string;
  }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert([{ 
          name: walletData.name, 
          currency: walletData.currency,
          balance: 0,
          user_id: user.id,
          password_protected: walletData.passwordProtected,
          backup_key: walletData.backupKey
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newWallet: Wallet = {
          id: data[0].id,
          name: data[0].name,
          balance: Number(data[0].balance || 0),
          currency: data[0].currency,
          passwordProtected: data[0].password_protected
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

  const handleDeleteWallet = (walletId: string) => {
    setWallets(wallets.filter(wallet => wallet.id !== walletId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wallets</h1>
            <p className="text-gray-500 text-sm">Manage your digital wallets</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 shadow-lg"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Wallet
          </Button>
        </div>
        
        {/* Total Balance Card */}
        {wallets.length > 0 && (
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium">Total Balance</p>
                <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
              </div>
              <WalletIcon className="h-8 w-8 text-primary-foreground/60" />
            </div>
          </div>
        )}
      </div>

      {/* Wallets Grid */}
      <div className="space-y-3">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <WalletCard 
              key={wallet.id} 
              wallet={wallet}
              onDelete={handleDeleteWallet}
              onClick={() => navigate(`/wallets/${wallet.id}`)}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <WalletIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets yet</h3>
            <p className="text-gray-500 mb-6">Create your first wallet to get started with managing your funds</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Wallet
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
