
import { Database as GeneratedDatabase } from "@/integrations/supabase/types";

export type Database = GeneratedDatabase & {
  public: {
    Tables: {
      bots: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          bot_type: 'binary' | 'nextbase' | 'contract';
          duration: number;
          profit_target: number;
          amount: number;
          status: 'running' | 'paused' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      delete_wallet: {
        Args: {
          wallet_id_param: string;
          password_param: string;
        };
        Returns: undefined;
      };
      get_user_bots: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          user_id: string;
          wallet_id: string;
          bot_type: 'binary' | 'nextbase' | 'contract';
          duration: number;
          profit_target: number;
          amount: number;
          status: 'running' | 'paused' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        }[];
      };
      create_bot: {
        Args: {
          user_id_param: string;
          wallet_id_param: string;
          bot_type_param: 'binary' | 'nextbase' | 'contract';
          duration_param: number;
          profit_target_param: number;
          amount_param: number;
        };
        Returns: { id: string };
      };
      increment_wallet_balance: {
        Args: {
          wallet_id_param: string;
          amount_param: number;
        };
        Returns: undefined;
      };
    };
  };
};
