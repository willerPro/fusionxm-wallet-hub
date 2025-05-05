
export type ActivityType = "deposit" | "withdrawal" | "investment" | "crypto_send" | "crypto_receive";

export interface Activity {
  id: string;
  type: ActivityType;
  amount: number;
  description: string;
  date: Date;
}

export interface CryptoTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: "send" | "receive";
  coin_type: "USDT" | "TRX";
  amount: number;
  address: string;
  tx_hash?: string;
  status: "pending" | "completed" | "failed";
  password_verified: boolean;
  created_at: string;
  updated_at: string;
}
