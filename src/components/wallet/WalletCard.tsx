import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "@/types/wallet";

interface WalletCardProps {
  walletId: string;
  onDelete: (walletId: string) => void;
  refetchWallets: () => Promise<void>;
}

const WalletCard: React.FC<WalletCardProps> = ({ walletId, onDelete, refetchWallets }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Wallet ID: {walletId}</h3>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            Delete
          </Button>
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
