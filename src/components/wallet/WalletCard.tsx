import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from '@/types/wallet';
import { deleteWallet as deleteWalletAction } from "@/actions/wallet-actions";
import { useTransition } from 'react';

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
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const handleDelete = (walletId: string) => {
    setDeleteConfirmation(true);
    startTransition(async () => {
      try {
        await deleteWalletAction(walletId);
        toast({
          title: "Wallet deleted",
          description: "Your wallet has been successfully deleted.",
        });
        if (onDelete) {
          onDelete(walletId);
        }
      } catch (error: any) {
        toast({
          title: "Error deleting wallet",
          description: error.message || "Failed to delete wallet. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeleteConfirmation(false);
      }
    });
  };

  return (
    <Card onClick={onClick} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={`https://avatars.dicebear.com/api/pixel-art/${wallet.name}.svg`} />
          <AvatarFallback>{wallet.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{wallet.name}</h2>
          <p className="text-sm text-gray-500">{wallet.currency}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView ? onView(wallet.id) : navigate(`/wallets/${wallet.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/wallets/edit/${wallet.id}`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:bg-red-50 hover:bg-red-50"
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
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-xl font-bold">
            {wallet.balance ? wallet.balance.toFixed(2) : '0.00'} {wallet.currency}
          </p>
          <p className="text-sm text-gray-500">Available Balance</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost">
          View Transactions
        </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(wallet.id.toString());
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletCard;
