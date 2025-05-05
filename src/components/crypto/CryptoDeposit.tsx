
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeDisplay from './QRCodeDisplay';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';
import { useAuth } from '@/components/auth/AuthContext';

const TRON_ADDRESS = "TY7V4VBvvharEHT5Ww1xzJtWfztDYQhRUc";

interface CryptoDepositProps {
  wallets: Wallet[];
  onSuccess: () => void;
}

const CryptoDeposit: React.FC<CryptoDepositProps> = ({ wallets, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [coinType, setCoinType] = useState<"USDT" | "TRX">("USDT");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleDeposit = async () => {
    if (!user || !selectedWalletId || !amount) {
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

    setIsSubmitting(true);

    try {
      // Create a pending deposit transaction
      const { data, error } = await supabase
        .from("crypto_transactions")
        .insert({
          wallet_id: selectedWalletId,
          user_id: user.id,
          type: "receive",
          coin_type: coinType,
          amount: numericAmount,
          address: TRON_ADDRESS,
          status: "pending"
        })
        .select("*");
      
      if (error) throw error;
      
      toast({
        title: "Deposit Initialized",
        description: "Your deposit has been recorded and is pending confirmation.",
      });
      
      setAmount("");
      onSuccess();
    } catch (error: any) {
      console.error("Error recording deposit:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "There was a problem recording your deposit.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Crypto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QRCodeDisplay walletAddress={TRON_ADDRESS} coinType={coinType} />
        
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
        
        <Button 
          className="w-full"
          onClick={handleDeposit}
          disabled={isSubmitting || !selectedWalletId || !amount}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Record Deposit"
          )}
        </Button>
        
        <div className="bg-yellow-50 p-3 rounded-md">
          <p className="text-sm text-yellow-800">
            This is a demo application. In a real application, deposits would be automatically detected by monitoring the blockchain.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoDeposit;
