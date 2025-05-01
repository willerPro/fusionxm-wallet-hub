
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

// Add a type for the RPC function parameter
export interface CreateBotParams {
  user_id_param: string;
  wallet_id_param: string;
  bot_type_param: BotType;
  duration_param: number;
  profit_target_param: number;
  amount_param: number;
}
