
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

const Withdraw = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [accountDetails, setAccountDetails] = useState("");

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setWallets(data.map(wallet => ({
          id: wallet.id,
          name: wallet.name,
          balance: parseFloat(wallet.balance) || 0,
          currency: wallet.currency
        })));
        
        if (data.length > 0) {
          setSelectedWalletId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error",
        description: "Could not fetch wallets. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWalletId || !amount || !withdrawalMethod || !accountDetails) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    
    if (!selectedWallet) {
      toast({
        title: "Error",
        description: "Selected wallet not found",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > selectedWallet.balance) {
      toast({
        title: "Insufficient funds",
        description: "You do not have enough funds for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        wallet_id: selectedWalletId,
        amount: withdrawAmount,
        type: "withdrawal",
        status: "processing"
      });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: selectedWallet.balance - withdrawAmount })
        .eq("id", selectedWalletId);

      if (updateError) throw updateError;

      toast({
        title: "Withdrawal requested",
        description: `Your withdrawal of ${withdrawAmount} ${selectedWallet.currency} is being processed.`,
      });

      navigate("/wallets");
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxAmount = (): number => {
    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    return selectedWallet ? selectedWallet.balance : 0;
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Withdraw Funds</h1>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="wallet" className="text-sm font-medium">
                  Select Wallet
                </label>
                {wallets.length > 0 ? (
                  <Select
                    value={selectedWalletId}
                    onValueChange={setSelectedWalletId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.balance.toFixed(2)} {wallet.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 text-sm border rounded-md bg-amber-50 text-amber-800 border-amber-200">
                    <div className="flex gap-2 items-center">
                      <AlertCircle className="h-4 w-4" />
                      <span>No wallets available</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  max={getMaxAmount()}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={wallets.length === 0}
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Available: {getMaxAmount().toFixed(2)} {selectedWalletId && wallets.find(w => w.id === selectedWalletId)?.currency}</span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setAmount(getMaxAmount().toString())}
                    disabled={wallets.length === 0}
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="method" className="text-sm font-medium">
                  Withdrawal Method
                </label>
                <Select
                  value={withdrawalMethod}
                  onValueChange={setWithdrawalMethod}
                  disabled={wallets.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="details" className="text-sm font-medium">
                  Account Details
                </label>
                <Input
                  id="details"
                  placeholder={
                    withdrawalMethod === "bank_transfer"
                      ? "Bank Account Number"
                      : withdrawalMethod === "crypto"
                      ? "Wallet Address"
                      : withdrawalMethod === "paypal"
                      ? "PayPal Email"
                      : "Account Details"
                  }
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  required
                  disabled={!withdrawalMethod || wallets.length === 0}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || wallets.length === 0 || !amount || !withdrawalMethod || !accountDetails}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" /> Withdraw Funds
                    </>
                  )}
                </Button>
              </div>

              {wallets.length === 0 && (
                <div className="pt-4 text-center">
                  <p className="text-sm text-amber-600">
                    You need to create a wallet first
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => navigate("/wallets")}
                  >
                    Go to Wallets
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdraw;
