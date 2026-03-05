export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          id: number
          ip_address: string | null
          team_id: number
          timestamp: string
          user_id: number | null
        }
        Insert: {
          action: string
          id?: number
          ip_address?: string | null
          team_id: number
          timestamp?: string
          user_id?: number | null
        }
        Update: {
          action?: string
          id?: number
          ip_address?: string | null
          team_id?: number
          timestamp?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: number
          team_id: number
          title: string | null
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          team_id: number
          title?: string | null
          updated_at?: string
          user_id: number
        }
        Update: {
          created_at?: string
          id?: number
          team_id?: number
          title?: string | null
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "chats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: number
          name: string
          owner: string
          product_features: Json | null
          team_id: number
          updated_at: string
          urls: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          name: string
          owner: string
          product_features?: Json | null
          team_id: number
          updated_at?: string
          urls?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
          owner?: string
          product_features?: Json | null
          team_id?: number
          updated_at?: string
          urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          id: number
          name: string
          organization_id: number | null
          phone: string | null
          state: string | null
          street: string | null
          team_id: number
          updated_at: string
          user_id: number
          zip: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name: string
          organization_id?: number | null
          phone?: string | null
          state?: string | null
          street?: string | null
          team_id: number
          updated_at?: string
          user_id: number
          zip?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string
          organization_id?: number | null
          phone?: string | null
          state?: string | null
          street?: string | null
          team_id?: number
          updated_at?: string
          user_id?: number
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          block_number: string | null
          category: string | null
          collection_id: number
          created_at: string
          description: string | null
          id: number
          last_updated: string
          team_id: number
          title: string | null
          updated_by: number
          vector: string | null
        }
        Insert: {
          block_number?: string | null
          category?: string | null
          collection_id: number
          created_at?: string
          description?: string | null
          id?: number
          last_updated?: string
          team_id: number
          title?: string | null
          updated_by: number
          vector?: string | null
        }
        Update: {
          block_number?: string | null
          category?: string | null
          collection_id?: number
          created_at?: string
          description?: string | null
          id?: number
          last_updated?: string
          team_id?: number
          title?: string | null
          updated_by?: number
          vector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_blocks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      embeddings: {
        Row: {
          content: string
          embedding: string
          id: string
          resource_id: string | null
          team_id: number
        }
        Insert: {
          content: string
          embedding: string
          id: string
          resource_id?: string | null
          team_id: number
        }
        Update: {
          content?: string
          embedding?: string
          id?: string
          resource_id?: string | null
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embeddings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          email: string
          id: number
          invited_at: string
          invited_by: number
          role: string
          status: string
          supabase_user_id: string | null
          team_id: number
        }
        Insert: {
          email: string
          id?: number
          invited_at?: string
          invited_by: number
          role: string
          status?: string
          supabase_user_id?: string | null
          team_id: number
        }
        Update: {
          email?: string
          id?: number
          invited_at?: string
          invited_by?: number
          role?: string
          status?: string
          supabase_user_id?: string | null
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: number
          content: string
          created_at: string
          id: number
          role: string
          team_id: number
          user_id: number
        }
        Insert: {
          chat_id: number
          content: string
          created_at?: string
          id?: number
          role: string
          team_id: number
          user_id: number
        }
        Update: {
          chat_id?: number
          content?: string
          created_at?: string
          id?: number
          role?: string
          team_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: number
          industry: string | null
          location: string | null
          name: string
          size: string | null
          status: string
          team_id: number
          updated_at: string
          user_id: number
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          industry?: string | null
          location?: string | null
          name: string
          size?: string | null
          status?: string
          team_id: number
          updated_at?: string
          user_id: number
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          industry?: string | null
          location?: string | null
          name?: string
          size?: string | null
          status?: string
          team_id?: number
          updated_at?: string
          user_id?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          content: string
          created_at: string
          id: string
          team_id: number
          updated_at: string
          user_id: number
        }
        Insert: {
          content: string
          created_at?: string
          id: string
          team_id: number
          updated_at?: string
          user_id: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          team_id?: number
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "resources_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_prompts: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          prompt: string
          team_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          prompt: string
          team_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          prompt?: string
          team_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_prompts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: number
          joined_at: string
          role: string
          team_id: number
          user_id: number
        }
        Insert: {
          id?: number
          joined_at?: string
          role: string
          team_id: number
          user_id: number
        }
        Update: {
          id?: number
          joined_at?: string
          role?: string
          team_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          ai_model: string
          ai_provider: string
          created_at: string
          example_data_industry: string | null
          id: number
          include_unrated_historical: boolean | null
          min_historical_evaluation_rank: number | null
          min_historical_similarity: string | null
          name: string
          onboarding_completed: boolean
          onboarding_step: number
          plan_name: string | null
          stripe_customer_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          used_example_data: boolean | null
        }
        Insert: {
          ai_model?: string
          ai_provider?: string
          created_at?: string
          example_data_industry?: string | null
          id?: number
          include_unrated_historical?: boolean | null
          min_historical_evaluation_rank?: number | null
          min_historical_similarity?: string | null
          name: string
          onboarding_completed?: boolean
          onboarding_step?: number
          plan_name?: string | null
          stripe_customer_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          used_example_data?: boolean | null
        }
        Update: {
          ai_model?: string
          ai_provider?: string
          created_at?: string
          example_data_industry?: string | null
          id?: number
          include_unrated_historical?: boolean | null
          min_historical_evaluation_rank?: number | null
          min_historical_similarity?: string | null
          name?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          plan_name?: string | null
          stripe_customer_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          used_example_data?: boolean | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: number
          name: string | null
          password_hash: string | null
          role: string
          supabase_auth_id: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: number
          name?: string | null
          password_hash?: string | null
          role?: string
          supabase_auth_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: number
          name?: string | null
          password_hash?: string | null
          role?: string
          supabase_auth_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_active_team_id: { Args: never; Returns: number }
      get_app_user_id: { Args: never; Returns: number }
      get_auth_user_id: { Args: never; Returns: string }
      is_team_member: { Args: { check_team_id: number }; Returns: boolean }
      search_similar_blocks: {
        Args: { p_limit?: number; p_query_vector: string; p_team_id: number }
        Returns: {
          block_number: string
          category: string
          collection_id: number
          description: string
          id: number
          similarity: number
          title: string
        }[]
      }
      update_block_embedding: {
        Args: { p_block_id: number; p_vector: string }
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
