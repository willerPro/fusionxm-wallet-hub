
export type BotType = 'binary' | 'nextbase' | 'contract';

export interface Bot {
  id: string;
  user_id: string;
  wallet_id: string;
  bot_type: BotType;
  duration: number;
  profit_target: number;
  amount: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}
