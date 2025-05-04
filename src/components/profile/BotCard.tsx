import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot } from '@/types/bot';
import { formatDistanceToNow } from 'date-fns';

export interface BotCardProps {
  bot: Bot;
  onBotUpdate?: () => Promise<void>;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onBotUpdate }) => {
  const timeAgo = formatDistanceToNow(new Date(bot.created_at), {
    addSuffix: true,
  });

  const handlePause = async () => {
    // Implement pause logic here
    console.log("Pause bot:", bot.id);
    if (onBotUpdate) {
      await onBotUpdate();
    }
  };

  const handleStop = async () => {
    // Implement stop logic here
    console.log("Stop bot:", bot.id);
    if (onBotUpdate) {
      await onBotUpdate();
    }
  };

  return (
    <Card className="bg-secondary/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{bot.bot_type} Bot</h3>
          <Badge variant="secondary">{bot.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Duration:</strong> {bot.duration} days
          </div>
          <div>
            <strong>Profit Target:</strong> {bot.profit_target}%
          </div>
          <div>
            <strong>Amount:</strong> {bot.amount} USDT
          </div>
          <div>
            <strong>Created:</strong> {timeAgo}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end p-4">
        <Button variant="outline" size="sm" className="mr-2" onClick={handlePause}>
          Pause
        </Button>
        <Button variant="destructive" size="sm" onClick={handleStop}>
          Stop
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BotCard;
