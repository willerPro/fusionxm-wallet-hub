
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';
import { useAuth } from '@/components/auth/AuthContext';
import { emailService } from '@/services/emailService';

export interface CryptoWithdrawProps {
  wallets?: Wallet[];
  onSuccess: () => Promise<void>;
}

const CryptoWithdraw: React.FC<CryptoWithdrawProps> = ({ wallets = [], onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [coinType, setCoinType] = useState<"USDT" | "TRX">("USDT");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !selectedWalletId || !amount || !address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    if (!selectedWallet || selectedWallet.balance < numericAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a send transaction
      const { data, error } = await supabase
        .from("crypto_transactions")
        .insert({
          wallet_id: selectedWalletId,
          user_id: user.id,
          type: "send",
          coin_type: coinType,
          amount: numericAmount,
          address: address,
          status: "pending"
        })
        .select("*");
      
      if (error) throw error;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: selectedWallet.balance - numericAmount })
        .eq("id", selectedWalletId);
      
      if (updateError) throw updateError;
      
      // Send email notification
      if (user.email) {
        try {
          await emailService.sendWithdrawalNotification({
            email: user.email,
            amount: numericAmount,
            coinType: coinType,
            address: address
          });
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
      }
      
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request has been submitted and is being processed.",
      });
      
      setAmount("");
      setAddress("");
      onSuccess();
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "There was a problem processing your withdrawal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Crypto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Wallet</Label>
          <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
            <SelectTrigger>
              <SelectValue placeholder="Select wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.currency} {wallet.balance.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Coin Type</Label>
          <Select value={coinType} onValueChange={(value: "USDT" | "TRX") => setCoinType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT (TRC20)</SelectItem>
              <SelectItem value="TRX">TRX</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Recipient Address</Label>
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet address"
          />
        </div>
        
        <Button 
          className="w-full"
          onClick={handleWithdraw}
          disabled={isSubmitting || !selectedWalletId || !amount || !address}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Withdraw"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CryptoWithdraw;
