
export type BotType = 'binary' | 'nextbase' | 'contract';
export type BotStatus = 'running' | 'paused' | 'completed' | 'failed';

export interface Bot {
  id: string;
  user_id: string;
  wallet_id: string | null;
  bot_type: BotType | null;
  duration: number | null;
  profit_target: number | null;
  profit: number;
  status: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}
