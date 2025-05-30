export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          amount_in_use: number | null
          created_at: string
          current_profit: number | null
          date_added: string
          date_ended: string | null
          description: string | null
          id: string
          next_update_set: string | null
          server_space_taken: number | null
          status: string
          updated_at: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          activity_type: string
          amount_in_use?: number | null
          created_at?: string
          current_profit?: number | null
          date_added?: string
          date_ended?: string | null
          description?: string | null
          id?: string
          next_update_set?: string | null
          server_space_taken?: number | null
          status?: string
          updated_at?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          activity_type?: string
          amount_in_use?: number | null
          created_at?: string
          current_profit?: number | null
          date_added?: string
          date_ended?: string | null
          description?: string | null
          id?: string
          next_update_set?: string | null
          server_space_taken?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          amount: number
          bot_type: string
          created_at: string
          duration: number
          id: string
          profit_target: number
          status: string
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          bot_type: string
          created_at?: string
          duration: number
          id?: string
          profit_target: number
          status?: string
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          bot_type?: string
          created_at?: string
          duration?: number
          id?: string
          profit_target?: number
          status?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bots_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_transactions: {
        Row: {
          address: string
          amount: number
          coin_type: string
          created_at: string | null
          id: string
          password_verified: boolean | null
          status: string | null
          tx_hash: string | null
          type: string
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          address: string
          amount: number
          coin_type: string
          created_at?: string | null
          id?: string
          password_verified?: boolean | null
          status?: string | null
          tx_hash?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          address?: string
          amount?: number
          coin_type?: string
          created_at?: string | null
          id?: string
          password_verified?: boolean | null
          status?: string | null
          tx_hash?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc: {
        Row: {
          created_at: string
          front_pic_id: string | null
          full_names: string
          id: string
          identity_number: string
          identity_type: string
          investor_id: string
          location: string | null
          picture: string | null
          rear_pic_id: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          front_pic_id?: string | null
          full_names: string
          id?: string
          identity_number: string
          identity_type: string
          investor_id: string
          location?: string | null
          picture?: string | null
          rear_pic_id?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          front_pic_id?: string | null
          full_names?: string
          id?: string
          identity_number?: string
          identity_type?: string
          investor_id?: string
          location?: string | null
          picture?: string | null
          rear_pic_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: true
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          id: string
          interest_rate: number
          max_amount: number | null
          min_amount: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          id?: string
          interest_rate: number
          max_amount?: number | null
          min_amount: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          interest_rate?: number
          max_amount?: number | null
          min_amount?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      server_details: {
        Row: {
          cores: number | null
          cpu: string | null
          cpu_usage: number | null
          disk_usage: number | null
          id: string
          last_update: string
          load_avg: number | null
          memory: string | null
          memory_usage: number | null
          name: string
          network_usage: number | null
          region: string | null
          status: string
          storage: string | null
          updated_at: string
          uptime: string | null
        }
        Insert: {
          cores?: number | null
          cpu?: string | null
          cpu_usage?: number | null
          disk_usage?: number | null
          id?: string
          last_update?: string
          load_avg?: number | null
          memory?: string | null
          memory_usage?: number | null
          name: string
          network_usage?: number | null
          region?: string | null
          status: string
          storage?: string | null
          updated_at?: string
          uptime?: string | null
        }
        Update: {
          cores?: number | null
          cpu?: string | null
          cpu_usage?: number | null
          disk_usage?: number | null
          id?: string
          last_update?: string
          load_avg?: number | null
          memory?: string | null
          memory_usage?: number | null
          name?: string
          network_usage?: number | null
          region?: string | null
          status?: string
          storage?: string | null
          updated_at?: string
          uptime?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status?: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          bot_alerts: boolean | null
          created_at: string | null
          email_alerts: boolean | null
          id: string
          login_alerts: boolean | null
          market_alerts: boolean | null
          news_updates: boolean | null
          two_factor: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bot_alerts?: boolean | null
          created_at?: string | null
          email_alerts?: boolean | null
          id?: string
          login_alerts?: boolean | null
          market_alerts?: boolean | null
          news_updates?: boolean | null
          two_factor?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bot_alerts?: boolean | null
          created_at?: string | null
          email_alerts?: boolean | null
          id?: string
          login_alerts?: boolean | null
          market_alerts?: boolean | null
          news_updates?: boolean | null
          two_factor?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          backup_key: string | null
          balance: number | null
          created_at: string
          currency: string
          id: string
          name: string
          password_protected: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_key?: string | null
          balance?: number | null
          created_at?: string
          currency?: string
          id?: string
          name: string
          password_protected?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_key?: string | null
          balance?: number | null
          created_at?: string
          currency?: string
          id?: string
          name?: string
          password_protected?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
