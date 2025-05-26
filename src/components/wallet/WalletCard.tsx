
import React, { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2, Eye, ChevronDown, ChevronUp, Wallet as WalletIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { deleteWallet } from "@/actions/wallet-actions";
import { Wallet } from '@/types/wallet';

interface WalletCardProps {
  wallet: Wallet;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onView,
  onDelete,
  onClick,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = (walletId: string) => {
    startTransition(() => {
      deleteWallet(walletId)
        .then(() => {
          toast({
            title: "Wallet deleted",
            description: "Your wallet has been successfully deleted.",
          });
          if (onDelete) {
            onDelete(walletId);
          }
        })
        .catch((error: any) => {
          toast({
            title: "Error deleting wallet",
            description: error.message || "Failed to delete wallet. Please try again.",
            variant: "destructive",
          });
        });
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatars.dicebear.com/api/pixel-art/${wallet.name}.svg`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {wallet.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {wallet.passwordProtected && (
                  <WalletIcon className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-500 bg-white rounded-full p-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{wallet.name}</h3>
                <p className="text-2xl font-bold text-primary">
                  {wallet.balance ? wallet.balance.toFixed(2) : '0.00'} <span className="text-sm font-normal text-gray-500">{wallet.currency}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onView ? onView(wallet.id) : navigate(`/wallets/${wallet.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/wallets/edit/${wallet.id}`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(wallet.id.toString());
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs uppercase font-medium">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs uppercase font-medium">Security</p>
                  <p className="font-semibold">
                    {wallet.passwordProtected ? "Protected" : "Standard"}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/wallets/${wallet.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate('/deposit')}
                >
                  Deposit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate('/withdraw')}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default WalletCard;
