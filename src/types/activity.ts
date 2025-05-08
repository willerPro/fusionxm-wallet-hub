
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
