
export type ActivityType = 'deposit' | 'withdrawal' | 'sent' | 'received' | 'crypto_send' | 'crypto_receive';

export interface Activity {
  id: string;
  type: ActivityType;
  amount: number;
  description: string;
  date: string;
  walletId?: string;
}
