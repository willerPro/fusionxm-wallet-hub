
export interface Transaction {
  id: string;
  amount: number; 
  created_at: string;
  status: string;
  type: string;
  user_id: string;
  wallet_id: string;
  transaction_type?: string;
  description?: string;
}

export interface Activity {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'payment';
  amount: number;
  description: string;
  date: string;
}

export interface CryptoTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  status: string;
  address: string;
  coin_type: string;
  type: string;
}
