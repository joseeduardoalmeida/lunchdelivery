export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          order: number
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
          order: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          order?: number
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          nickname: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          nickname?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          profile_picture: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          profile_picture?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          profile_picture?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          change_amount: number | null
          created_at: string
          customer_address: string
          customer_name: string
          customer_whatsapp: string
          delivery_person: string | null
          delivery_person_name: string | null
          id: string
          observation: string | null
          order_items: Json
          original_order_id: string | null
          payment_method: string | null
          payment_receipt: string | null
          payment_status: string | null
          status: string
          total_amount: number
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          change_amount?: number | null
          created_at?: string
          customer_address: string
          customer_name: string
          customer_whatsapp: string
          delivery_person?: string | null
          delivery_person_name?: string | null
          id?: string
          observation?: string | null
          order_items: Json
          original_order_id?: string | null
          payment_method?: string | null
          payment_receipt?: string | null
          payment_status?: string | null
          status?: string
          total_amount: number
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          change_amount?: number | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_whatsapp?: string
          delivery_person?: string | null
          delivery_person_name?: string | null
          id?: string
          observation?: string | null
          order_items?: Json
          original_order_id?: string | null
          payment_method?: string | null
          payment_receipt?: string | null
          payment_status?: string | null
          status?: string
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_original_order_id_fkey"
            columns: ["original_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_accessed: string
          session_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_accessed?: string
          session_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_accessed?: string
          session_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_users: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          password: string
          password_hash: string | null
          updated_at: string
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          password: string
          password_hash?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          password?: string
          password_hash?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_type: string
          attempted_at: string
          id: string
          identifier: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_type: string
          attempted_at?: string
          id?: string
          identifier: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          attempted_at?: string
          id?: string
          identifier?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean
          category_id: string
          created_at: string
          description: string
          id: string
          image: string
          name: string
          preparation_time: number
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category_id: string
          created_at?: string
          description: string
          id?: string
          image: string
          name: string
          preparation_time: number
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          name?: string
          preparation_time?: number
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          customizations: string[] | null
          id: string
          menu_item_id: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          customizations?: string[] | null
          id?: string
          menu_item_id: string
          order_id: string
          price: number
          quantity: number
        }
        Update: {
          customizations?: string[] | null
          id?: string
          menu_item_id?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notifications: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_whatsapp: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          order_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_whatsapp?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          order_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_whatsapp?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          order_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_reviews: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_whatsapp: string | null
          delivery_rating: number | null
          food_rating: number
          id: string
          order_id: string
          review_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_whatsapp?: string | null
          delivery_rating?: number | null
          food_rating: number
          id?: string
          order_id: string
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_whatsapp?: string | null
          delivery_rating?: number | null
          food_rating?: number
          id?: string
          order_id?: string
          review_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          change_amount: number | null
          created_at: string
          delivery_info: Json | null
          estimated_time: number
          id: string
          observation: string | null
          payment_method: string | null
          payment_receipt: string | null
          payment_status: string | null
          raffle_number: string | null
          status: string
          total: number
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          change_amount?: number | null
          created_at?: string
          delivery_info?: Json | null
          estimated_time: number
          id?: string
          observation?: string | null
          payment_method?: string | null
          payment_receipt?: string | null
          payment_status?: string | null
          raffle_number?: string | null
          status: string
          total: number
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          change_amount?: number | null
          created_at?: string
          delivery_info?: Json | null
          estimated_time?: number
          id?: string
          observation?: string | null
          payment_method?: string | null
          payment_receipt?: string | null
          payment_status?: string | null
          raffle_number?: string | null
          status?: string
          total?: number
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_logs: {
        Row: {
          created_at: string
          error_details: string | null
          id: string
          request_ip: unknown | null
          reset_type: string
          user_agent: string | null
          user_email: string
        }
        Insert: {
          created_at?: string
          error_details?: string | null
          id?: string
          request_ip?: unknown | null
          reset_type: string
          user_agent?: string | null
          user_email: string
        }
        Update: {
          created_at?: string
          error_details?: string | null
          id?: string
          request_ip?: unknown | null
          reset_type?: string
          user_agent?: string | null
          user_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          profile_picture: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          profile_picture?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          profile_picture?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          is_default: boolean
          nickname: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_default?: boolean
          nickname?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_default?: boolean
          nickname?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_combos: {
        Row: {
          active: boolean
          created_at: string
          description: string
          discount_percentage: number
          end_date: string
          id: string
          image: string | null
          items: Json
          name: string
          original_price: number
          promotional_price: number
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          discount_percentage: number
          end_date: string
          id?: string
          image?: string | null
          items: Json
          name: string
          original_price: number
          promotional_price: number
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          discount_percentage?: number
          end_date?: string
          id?: string
          image?: string | null
          items?: Json
          name?: string
          original_price?: number
          promotional_price?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_draws: {
        Row: {
          created_at: string
          draw_date: string | null
          id: string
          is_completed: boolean
          participating_orders_count: number | null
          updated_at: string
          week_end_date: string
          week_start_date: string
          winner_customer_email: string | null
          winner_customer_name: string | null
          winner_customer_whatsapp: string | null
          winner_order_id: string | null
          winner_raffle_number: string | null
        }
        Insert: {
          created_at?: string
          draw_date?: string | null
          id?: string
          is_completed?: boolean
          participating_orders_count?: number | null
          updated_at?: string
          week_end_date: string
          week_start_date: string
          winner_customer_email?: string | null
          winner_customer_name?: string | null
          winner_customer_whatsapp?: string | null
          winner_order_id?: string | null
          winner_raffle_number?: string | null
        }
        Update: {
          created_at?: string
          draw_date?: string | null
          id?: string
          is_completed?: boolean
          participating_orders_count?: number | null
          updated_at?: string
          week_end_date?: string
          week_start_date?: string
          winner_customer_email?: string | null
          winner_customer_name?: string | null
          winner_customer_whatsapp?: string | null
          winner_order_id?: string | null
          winner_raffle_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_user: {
        Args: { user_email: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_attempt_type: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          p_identifier: string
          p_attempt_type: string
          p_success: boolean
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
