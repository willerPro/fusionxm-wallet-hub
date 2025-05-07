import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CryptoWithdrawProps {
  onClose: () => void;
  walletId: string;
}

interface WithdrawFormData {
  amount: string;
  address: string;
}

const CryptoWithdraw = ({ onClose, walletId }: CryptoWithdrawProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<WithdrawFormData>({
    amount: '',
    address: '',
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BTC');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleWithdraw = async (formData: WithdrawFormData) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || !formData.address) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check user's wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;

      if (!walletData) {
        toast({
          title: "Wallet not found",
          description: "Could not find the specified wallet.",
          variant: "destructive",
        });
        return;
      }

      const walletBalance = walletData.balance;

      if (amount > walletBalance) {
        toast({
          title: "Insufficient balance",
          description: "You do not have enough funds in your wallet to complete this withdrawal.",
          variant: "destructive",
        });
        return;
      }

      // Prepare the transaction data
      const transactionData = {
        user_id: user.id,
        wallet_id: walletId,
        amount: amount,
        type: 'withdraw',
        status: 'pending',
        to_address: formData.address,
        description: `Withdrawal to ${formData.address}`,
        crypto_currency: selectedCurrency,
      };

      // Create the withdrawal transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error("Transaction creation error:", transactionError);
        toast({
          title: "Transaction Failed",
          description: "Failed to create the withdrawal transaction.",
          variant: "destructive",
        });
        return;
      }

      // Update the wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: walletBalance - amount })
        .eq('id', walletId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Wallet update error:", updateError);
        toast({
          title: "Withdrawal Failed",
          description: "Failed to update wallet balance. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Withdrawal initiated",
        description: `Successfully initiated withdrawal of ${amount} ${selectedCurrency} to ${formData.address}.`,
      });
      onClose();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crypto Withdrawal</DialogTitle>
        <DialogDescription>
          Enter the amount and address to withdraw to.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            type="number"
            id="amount"
            name="amount"
            placeholder="0.00"
            className="col-span-3"
            value={formData.amount}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currency" className="text-right">
            Currency
          </Label>
          <Select onValueChange={setSelectedCurrency} defaultValue={selectedCurrency}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              {/* Add more currencies here */}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">
            Address
          </Label>
          <Input
            type="text"
            id="address"
            name="address"
            placeholder="Enter wallet address"
            className="col-span-3"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={() => handleWithdraw(formData)} disabled={isLoading}>
          {isLoading ? "Withdrawing..." : "Withdraw"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CryptoWithdraw;
