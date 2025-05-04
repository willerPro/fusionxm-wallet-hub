
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Copy, 
  Check,
  AlertCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletCardProps {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isPasswordProtected: boolean;
  onUpdate: () => void;
}

const WalletCard = ({ 
  id,
  name, 
  balance, 
  currency,
  isPasswordProtected,
  onUpdate 
}: WalletCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Format balance with 2 decimal places
  const formattedBalance = balance.toFixed(2);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const { error } = await supabase.rpc('delete_wallet', {
        wallet_id_param: id,
        password_param: password
      });
      
      if (error) {
        console.error("Error deleting wallet:", error);
        setError(error.message || "Failed to delete wallet");
        setIsDeleting(false);
        return;
      }
      
      toast({
        title: "Wallet deleted",
        description: `Your wallet "${name}" has been deleted.`,
        duration: 3000,
      });
      
      setDeleteDialogOpen(false);
      onUpdate();
    } catch (err: any) {
      console.error("Exception deleting wallet:", err);
      setError(err.message || "An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium truncate max-w-[180px]" title={name}>{name}</h3>
            <div className="flex items-center text-xs text-gray-500 gap-1 mt-1">
              <span className="truncate max-w-[100px]" title={id}>{id.substring(0, 8)}...</span>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full" 
                onClick={handleCopyToClipboard}
                title="Copy wallet ID"
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive cursor-pointer" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4">
          <p className="text-2xl font-semibold">{currency} {formattedBalance}</p>
          <p className="text-xs text-gray-500 mt-1">
            {isPasswordProtected ? "Password protected" : "No password protection"}
          </p>
        </div>
      </CardContent>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wallet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wallet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isPasswordProtected && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Enter wallet password to confirm deletion
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting || (isPasswordProtected && !password)}
            >
              {isDeleting ? "Deleting..." : "Delete Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WalletCard;
