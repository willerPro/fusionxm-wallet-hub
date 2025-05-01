
import { Bot } from "@/types/bot";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, Clock, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BotCardProps {
  bot: Bot;
  walletName?: string;
}

const getBotTypeLabel = (type: string) => {
  switch(type) {
    case 'binary': return 'Binary Trading (Pocket Option)';
    case 'nextbase': return 'Nextbase Bot';
    case 'contract': return 'Contract Bot';
    default: return type;
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'running': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'completed': return 'bg-blue-500';
    case 'failed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const BotCard = ({ bot, walletName }: BotCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{getBotTypeLabel(bot.bot_type)}</CardTitle>
          <Badge className={`${getStatusColor(bot.status)}`}>
            {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
          </Badge>
        </div>
        <CardDescription>
          Created {formatDistanceToNow(new Date(bot.created_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{walletName || 'Wallet'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{bot.duration} days</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{bot.profit_target}% profit target</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">${bot.amount.toFixed(2)}</span>
            <span className="text-sm text-gray-500">invested</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-gray-500 w-full text-center">
          {bot.status === 'running' 
            ? 'Bot is currently running' 
            : `Bot ${bot.status} on ${new Date(bot.updated_at).toLocaleDateString()}`}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BotCard;
