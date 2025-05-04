import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';
import { BotType } from '@/types/bot';

export interface BotFormProps {
  onSubmit: (botData: {
    walletId: string;
    botType: BotType;
    duration: number;
    profitTarget: number;
    amount: number;
  }) => Promise<void>;
  onCancel?: () => void;
}

const BotForm: React.FC<BotFormProps> = ({ onSubmit, onCancel }) => {
  const [walletId, setWalletId] = useState<string>('');
  const [botType, setBotType] = useState<BotType>('binary');
  const [duration, setDuration] = useState<number>(1);
  const [profitTarget, setProfitTarget] = useState<number>(5);
  const [amount, setAmount] = useState<number>(500);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const { data, error } = await supabase
          .from("wallets")
          .select("*");

        if (error) throw error;

        setWallets(data as Wallet[]);
      } catch (error) {
        console.error("Error fetching wallets:", error);
      }
    };

    fetchWallets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ walletId, botType, duration, profitTarget, amount });
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium leading-none pb-2">Wallet</label>
            <Select onValueChange={setWalletId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>{wallet.name} ({wallet.currency})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-none pb-2">Bot Type</label>
            <Select onValueChange={setBotType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bot type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binary</SelectItem>
                <SelectItem value="nextbase">NextBase</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-none pb-2">Duration (Days)</label>
            <Slider
              defaultValue={[1]}
              max={30}
              min={1}
              step={1}
              onValueChange={(value) => setDuration(value[0])}
            />
            <Input type="number" value={duration} readOnly className="mt-2" />
          </div>

          <div>
            <label className="block text-sm font-medium leading-none pb-2">Profit Target (%)</label>
            <Slider
              defaultValue={[5]}
              max={20}
              min={1}
              step={1}
              onValueChange={(value) => setProfitTarget(value[0])}
            />
            <Input type="number" value={profitTarget} readOnly className="mt-2" />
          </div>

          <div>
            <label className="block text-sm font-medium leading-none pb-2">Amount (USDT)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Bot</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BotForm;
