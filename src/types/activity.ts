
export type ActivityType = 'deposit' | 'withdrawal' | 'sent' | 'received' | 'crypto_send' | 'crypto_receive';

export interface Activity {
  id: string;
  type: ActivityType;
  amount: number;
  description: string;
  date: string;
  walletId?: string;
}

export interface CryptoTransaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  asset: string;
  address: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  hash?: string;
  walletId?: string;
  
  // Additional properties needed by the app
  coin_type?: string;
  tx_hash?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  password_verified?: boolean;
}
