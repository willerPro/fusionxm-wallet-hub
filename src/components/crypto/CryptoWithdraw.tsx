import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Loader2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet as WalletType } from '@/types/wallet';
import { useAuth } from '@/components/auth/AuthContext';

interface CryptoWithdrawProps {
  wallets: WalletType[];
  onSuccess: () => void;
}

const CryptoWithdraw: React.FC<CryptoWithdrawProps> = ({ wallets, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [coinType, setCoinType] = useState<"USDT" | "TRX">("USDT");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  const handleInitiateWithdraw = () => {
    if (!selectedWalletId || !amount || !address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
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

    if (selectedWallet && numericAmount > selectedWallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "The amount exceeds your wallet balance.",
        variant: "destructive",
      });
      return;
    }

    // Show password confirmation dialog for all withdrawals
    setIsPasswordDialogOpen(true);
  };

  const handleWithdraw = async () => {
    if (!user || !selectedWalletId || !amount || !address || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including password.",
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

    if (selectedWallet && numericAmount > selectedWallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "The amount exceeds your wallet balance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would verify the password here
      // For this demo, we'll just check if the password field isn't empty
      if (!password) {
        throw new Error("Password is required");
      }

      // Create the transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from("crypto_transactions")
        .insert({
          wallet_id: selectedWalletId,
          user_id: user.id,
          type: "send",
          coin_type: coinType,
          amount: numericAmount,
          address: address,
          status: "completed",
          password_verified: true
        })
        .select();
      
      if (transactionError) throw transactionError;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .rpc('decrement_balance', {
          wallet_id_param: selectedWalletId.toString() as string, // Update this line
          amount_param: numericAmount
        });

      if (updateError) throw updateError;
      
      toast({
        title: "Withdrawal Successful",
        description: `Your ${coinType} has been sent to the specified address.`,
      });
      
      // Reset form and close dialog
      setAmount("");
      setAddress("");
      setPassword("");
      setIsPasswordDialogOpen(false);
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
    <>
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
          
          {selectedWallet && (
            <div className="p-3 bg-blue-50 rounded-md flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-blue-600">
                Available balance: {selectedWallet.balance.toFixed(2)} {selectedWallet.currency}
              </p>
            </div>
          )}
          
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
              placeholder="TRC20 Wallet Address"
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={handleInitiateWithdraw}
            disabled={isSubmitting || !selectedWalletId || !amount || !address}
          >
            Withdraw
          </Button>
          
          <div className="bg-yellow-50 p-3 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <p className="text-sm text-yellow-800">
              All withdrawals require password confirmation. Please enter your wallet password when prompted.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Confirmation</DialogTitle>
            <DialogDescription>
              Please enter your wallet password to authorize this withdrawal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your wallet password"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                Withdrawing {amount} {coinType} to address {address.slice(0, 10)}...{address.slice(-6)}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPasswordDialogOpen(false);
              setPassword("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isSubmitting || !password}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CryptoWithdraw;
