
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
  activity_type: string | null;
  amount: number;
  created_at: string;
  current_profit: number | null;
  date_added: string | null;
  description: string | null;
  is_active: boolean | null;
  name: string;
  profit: number | null;
  status: string;
  total_earned: number | null;
  type: string;
  updated_at: string;
  user_id: string;
  wallet_id: string | null;
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
