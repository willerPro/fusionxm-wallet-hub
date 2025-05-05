
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  passwordProtected?: boolean;
  password_protected?: boolean; // Database field name
  backup_key?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
