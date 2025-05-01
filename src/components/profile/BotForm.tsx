
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BotType } from "@/types/bot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

type BotFormProps = {
  onSubmit: (botData: {
    walletId: string;
    botType: BotType;
    duration: number;
    profitTarget: number;
    amount: number;
  }) => void;
  isLoading: boolean;
  wallets: Wallet[];
};

const BotForm = ({ onSubmit, isLoading, wallets }: BotFormProps) => {
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [botType, setBotType] = useState<BotType>("binary");
  const [duration, setDuration] = useState<number>(30);
  const [profitTarget, setProfitTarget] = useState<number>(15);
  const [amount, setAmount] = useState<number>(500);
  
  // Min amount requirements
  const minAmounts: Record<BotType, number> = {
    binary: 500,
    nextbase: 3000,
    contract: 2600
  };
  
  // Get the selected wallet object
  const wallet = wallets.find(w => w.id === selectedWallet);
  const walletBalance = wallet?.balance || 0;
  
  // Get min amount based on bot type
  const minAmount = minAmounts[botType];
  
  // Check if form is valid
  const isFormValid = selectedWallet && 
    amount >= minAmount && 
    amount <= walletBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFormValid) {
      onSubmit({
        walletId: selectedWallet,
        botType,
        duration,
        profitTarget,
        amount
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="wallet" className="text-sm font-medium">
              Select Wallet
            </label>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger id="wallet">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: wallet.currency
                    }).format(wallet.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="botType" className="text-sm font-medium">
              Bot Type
            </label>
            <Select value={botType} onValueChange={(value) => setBotType(value as BotType)}>
              <SelectTrigger id="botType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binary Options Bot</SelectItem>
                <SelectItem value="nextbase">Nextbase Pro Bot</SelectItem>
                <SelectItem value="contract">Contract Trading Bot</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Minimum amount: {new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: wallet?.currency || 'USD'
              }).format(minAmount)}
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Investment Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={minAmount}
              max={walletBalance}
              required
            />
            {selectedWallet && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min: {minAmount}</span>
                <span>Available: {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: wallet?.currency || 'USD'
                }).format(walletBalance)}</span>
              </div>
            )}
            {amount < minAmount && (
              <p className="text-xs text-red-500">
                Amount must be at least {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: wallet?.currency || 'USD'
                }).format(minAmount)}
              </p>
            )}
            {amount > walletBalance && (
              <p className="text-xs text-red-500">
                Amount cannot exceed your wallet balance
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Duration (days): {duration}
            </label>
            <Slider
              value={[duration]}
              onValueChange={(values) => setDuration(values[0])}
              min={1}
              max={90}
              step={1}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 day</span>
              <span>90 days</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Profit Target (%): {profitTarget}
            </label>
            <Slider
              value={[profitTarget]}
              onValueChange={(values) => setProfitTarget(values[0])}
              min={5}
              max={50}
              step={1}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating..." : "Create Trading Bot"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BotForm;
