
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, Trash } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  passwordProtected?: boolean;
};

type WalletCardProps = {
  wallet: Wallet;
  onSelect?: (wallet: Wallet) => void;
  onDelete?: (walletId: string) => void;
  refetchWallets?: () => void;
};

const WalletCard = ({ wallet, onSelect, onDelete, refetchWallets }: WalletCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: wallet.currency,
  }).format(wallet.balance);

  const handleClick = () => {
    if (onSelect) {
      onSelect(wallet);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setPassword("");
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      if (wallet.passwordProtected && !password) {
        setDeleteError("Password is required to delete this wallet");
        setIsDeleting(false);
        return;
      }

      const { error } = await supabase
        .rpc('delete_wallet', { 
          wallet_id_param: wallet.id,
          password_param: password 
        });

      if (error) {
        console.error("Error deleting wallet:", error);
        if (error.message.includes("password")) {
          setDeleteError("Invalid password");
        } else {
          setDeleteError("Failed to delete wallet. Please try again.");
        }
        return;
      }

      setDeleteDialogOpen(false);
      toast({
        title: "Wallet deleted",
        description: `${wallet.name} has been deleted successfully.`,
      });
      
      if (onDelete) {
        onDelete(wallet.id);
      }
      
      if (refetchWallets) {
        refetchWallets();
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
      setDeleteError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-primary">{wallet.name}</h3>
            {wallet.passwordProtected && <Lock className="h-4 w-4 text-primary" aria-label="Password protected" />}
          </div>
          <p className="mt-1 text-2xl font-semibold">{formattedBalance}</p>
          
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/deposit?walletId=${wallet.id}`);
              }}
            >
              Deposit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/withdraw?walletId=${wallet.id}`);
              }}
            >
              Withdraw
            </Button>
          </div>
          
          <div className="mt-3">
            <Button 
              size="sm" 
              variant="destructive" 
              className="w-full"
              onClick={handleDeleteClick}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete Wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wallet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {wallet.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {wallet.passwordProtected && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Enter wallet password to confirm deletion
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Wallet password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {deleteError && (
                <p className="text-sm text-red-500">{deleteError}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={wallet.passwordProtected && !password || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletCard;
