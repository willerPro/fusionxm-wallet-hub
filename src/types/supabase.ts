
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
  };
};
