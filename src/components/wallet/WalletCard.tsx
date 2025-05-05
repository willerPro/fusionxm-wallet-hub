
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "@/types/wallet";

interface WalletCardProps {
  walletId: string;
  onDelete: (walletId: string) => void;
  refetchWallets: () => Promise<void>;
}

const WalletCard: React.FC<WalletCardProps> = ({ walletId, onDelete, refetchWallets }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const { toast } = useToast();

  // Fetch wallet details
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', walletId)
          .single();
        
        if (error) throw error;
        
        setWallet({
          id: data.id,
          name: data.name,
          balance: parseFloat(data.balance || 0),
          currency: data.currency,
          passwordProtected: data.password_protected || false
        });
      } catch (error) {
        console.error("Error fetching wallet details:", error);
      }
    };
    
    fetchWallet();
  }, [walletId]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('wallets').delete().eq('id', walletId);

      if (error) {
        throw error;
      }

      onDelete(walletId);
      toast({
        title: "Wallet deleted",
        description: "Your wallet has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting wallet:", error);
      toast({
        title: "Error deleting wallet",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="bg-white shadow-md rounded-md">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{wallet?.name || `Wallet ${walletId.slice(0, 8)}`}</h3>
              <p className="text-gray-600">{wallet?.currency || 'USD'} {wallet?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete
            </Button>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to={`/deposit?walletId=${walletId}`}>Deposit</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to={`/withdraw?walletId=${walletId}`}>Withdraw</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to="/crypto">Crypto</Link>
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your wallet
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              Deleting this wallet will remove all associated data.
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WalletCard;
