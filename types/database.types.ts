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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          marked_by: string | null
          member_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          marked_by?: string | null
          member_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          marked_by?: string | null
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_posts: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          post_type: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          post_type?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          post_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          category: string
          created_at: string | null
          description: string
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      core_deals: {
        Row: {
          amount: number | null
          created_at: string | null
          creator_id: string
          deal_type: string
          description: string | null
          house_id: string | null
          id: string
          status: string | null
          title: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          creator_id: string
          deal_type: string
          description?: string | null
          house_id?: string | null
          id?: string
          status?: string | null
          title: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          creator_id?: string
          deal_type?: string
          description?: string | null
          house_id?: string | null
          id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "core_deals_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      core_house_members: {
        Row: {
          created_at: string | null
          house_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          house_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          house_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "core_house_members_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "core_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      core_houses: {
        Row: {
          city: string
          country: string
          created_at: string | null
          house_name: string
          id: string
          state: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          house_name: string
          id?: string
          state: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          house_name?: string
          id?: string
          state?: string
        }
        Relationships: []
      }
      core_i2we: {
        Row: {
          created_at: string | null
          house_id: string
          id: string
          meeting_date: string
          member_1_id: string
          member_2_id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          house_id: string
          id?: string
          meeting_date: string
          member_1_id: string
          member_2_id: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          house_id?: string
          id?: string
          meeting_date?: string
          member_1_id?: string
          member_2_id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "core_i2we_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      core_links: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          description: string | null
          from_user_id: string
          house_id: string | null
          id: string
          status: Database["public"]["Enums"]["link_status"] | null
          title: string
          to_user_id: string
          urgency: number | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          description?: string | null
          from_user_id: string
          house_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["link_status"] | null
          title: string
          to_user_id: string
          urgency?: number | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          description?: string | null
          from_user_id?: string
          house_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["link_status"] | null
          title?: string
          to_user_id?: string
          urgency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "core_links_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "core_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      core_memberships: {
        Row: {
          created_at: string | null
          financial_year: string
          id: string
          membership_status:
            | Database["public"]["Enums"]["membership_status"]
            | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          user_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          financial_year: string
          id?: string
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          user_id: string
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          financial_year?: string
          id?: string
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          user_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      deal_participants: {
        Row: {
          deal_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          deal_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          deal_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "core_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          deal_date: string
          description: string
          from_member_id: string | null
          house_id: string | null
          id: string
          to_member_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          deal_date: string
          description: string
          from_member_id?: string | null
          house_id?: string | null
          id?: string
          to_member_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          deal_date?: string
          description?: string
          from_member_id?: string | null
          house_id?: string | null
          id?: string
          to_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      houses: {
        Row: {
          country: string
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          mobile: string | null
          name: string
          state: string
          zone: string
        }
        Insert: {
          country?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          mobile?: string | null
          name: string
          state: string
          zone: string
        }
        Update: {
          country?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          mobile?: string | null
          name?: string
          state?: string
          zone?: string
        }
        Relationships: []
      }
      i2we_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          event_name: string
          id: string
          member_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_name: string
          id?: string
          member_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_name?: string
          id?: string
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i2we_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i2we_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          from_member_id: string | null
          house_id: string | null
          id: string
          to_member_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          from_member_id?: string | null
          house_id?: string | null
          id?: string
          to_member_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          from_member_id?: string | null
          house_id?: string | null
          id?: string
          to_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          business: string | null
          house_id: string | null
          id: string
          industry: string | null
          joined_at: string | null
          keywords: string[] | null
          profile_id: string | null
        }
        Insert: {
          business?: string | null
          house_id?: string | null
          id?: string
          industry?: string | null
          joined_at?: string | null
          keywords?: string[] | null
          profile_id?: string | null
        }
        Update: {
          business?: string | null
          house_id?: string | null
          id?: string
          industry?: string | null
          joined_at?: string | null
          keywords?: string[] | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          ai_inactive_reminder: boolean | null
          ai_match_suggestion: boolean | null
          application_approved: boolean | null
          application_submitted: boolean | null
          attendance_marked: boolean | null
          created_at: string | null
          deal_recorded: boolean | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          link_received: boolean | null
          meeting_reminder: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_inactive_reminder?: boolean | null
          ai_match_suggestion?: boolean | null
          application_approved?: boolean | null
          application_submitted?: boolean | null
          attendance_marked?: boolean | null
          created_at?: string | null
          deal_recorded?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          link_received?: boolean | null
          meeting_reminder?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_inactive_reminder?: boolean | null
          ai_match_suggestion?: boolean | null
          application_approved?: boolean | null
          application_submitted?: boolean | null
          attendance_marked?: boolean | null
          created_at?: string | null
          deal_recorded?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          link_received?: boolean | null
          meeting_reminder?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          delivery_status: string | null
          error_message: string | null
          fcm_message_id: string | null
          id: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          delivery_status?: string | null
          error_message?: string | null
          fcm_message_id?: string | null
          id?: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          delivery_status?: string | null
          error_message?: string | null
          fcm_message_id?: string | null
          id?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          auth_user_id: string | null
          avatar_url: string | null
          business: string | null
          created_at: string | null
          email: string
          full_name: string
          house_id: string | null
          id: string
          industry: string | null
          keywords: string[] | null
          mobile: string | null
          role: string
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          approval_status?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          business?: string | null
          created_at?: string | null
          email: string
          full_name: string
          house_id?: string | null
          id: string
          industry?: string | null
          keywords?: string[] | null
          mobile?: string | null
          role?: string
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          approval_status?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          business?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          house_id?: string | null
          id?: string
          industry?: string | null
          keywords?: string[] | null
          mobile?: string | null
          role?: string
          updated_at?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          device_type: string
          expo_push_token: string
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          device_type: string
          expo_push_token: string
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string
          expo_push_token?: string
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          absence_count: number | null
          attendance_status:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          business_category: string | null
          city: string | null
          country: string | null
          created_at: string | null
          full_name: string
          id: string
          is_suspended: boolean | null
          phone_number: string | null
          state: string | null
          vertical_type: Database["public"]["Enums"]["vertical_type"] | null
        }
        Insert: {
          absence_count?: number | null
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          business_category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_suspended?: boolean | null
          phone_number?: string | null
          state?: string | null
          vertical_type?: Database["public"]["Enums"]["vertical_type"] | null
        }
        Update: {
          absence_count?: number | null
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          business_category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_suspended?: boolean | null
          phone_number?: string | null
          state?: string | null
          vertical_type?: Database["public"]["Enums"]["vertical_type"] | null
        }
        Relationships: []
      }
      virtual_memberships: {
        Row: {
          created_at: string | null
          financial_year: string
          id: string
          membership_status:
            | Database["public"]["Enums"]["membership_status"]
            | null
          user_id: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          created_at?: string | null
          financial_year: string
          id?: string
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          user_id: string
          valid_from: string
          valid_to: string
        }
        Update: {
          created_at?: string | null
          financial_year?: string
          id?: string
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          user_id?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_member: {
        Args: { member_id: string; new_status: string }
        Returns: undefined
      }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_approval_status: { Args: { user_id: string }; Returns: string }
      get_user_role: { Args: { user_id: string }; Returns: string }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      search_knowledge: {
        Args: { match_limit?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      signup_user: {
        Args: {
          p_business: string
          p_email: string
          p_full_name: string
          p_industry: string
          p_mobile: string
          p_password: string
        }
        Returns: Json
      }
    }
    Enums: {
      attendance_status:
        | "normal"
        | "probation"
        | "category_open"
        | "removal_eligible"
      link_status: "open" | "closed"
      membership_status: "active" | "expired" | "suspended"
      membership_type: "regular" | "privileged"
      vertical_type: "inner_circle" | "open_circle"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      attendance_status: [
        "normal",
        "probation",
        "category_open",
        "removal_eligible",
      ],
      link_status: ["open", "closed"],
      membership_status: ["active", "expired", "suspended"],
      membership_type: ["regular", "privileged"],
      vertical_type: ["inner_circle", "open_circle"],
    },
  },
} as const
