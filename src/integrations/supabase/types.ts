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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          completed_at: string
          created_at: string | null
          deleted_at: string | null
          duration_minutes: number | null
          goal_id: string | null
          id: string
          intensity_level: string | null
          is_deleted: boolean | null
          notes: string | null
          photo_url: string | null
          rpe_rating: number | null
          session_type: string | null
          user_id: string
        }
        Insert: {
          completed_at: string
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          intensity_level?: string | null
          is_deleted?: boolean | null
          notes?: string | null
          photo_url?: string | null
          rpe_rating?: number | null
          session_type?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          intensity_level?: string | null
          is_deleted?: boolean | null
          notes?: string | null
          photo_url?: string | null
          rpe_rating?: number | null
          session_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_triggers: {
        Row: {
          id: string
          sent_at: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          id?: string
          sent_at?: string | null
          trigger_type: string
          user_id: string
        }
        Update: {
          id?: string
          sent_at?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      cost_tracking: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_context: {
        Row: {
          created_at: string | null
          date: string
          energy_level: number | null
          id: string
          sleep_notes: string | null
          sleep_quality: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          sleep_notes?: string | null
          sleep_quality?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          sleep_notes?: string | null
          sleep_quality?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exercise_alternatives: {
        Row: {
          alternative_exercise: string
          body_area: string
          created_at: string | null
          description: string | null
          id: string
          original_exercise: string
        }
        Insert: {
          alternative_exercise: string
          body_area: string
          created_at?: string | null
          description?: string | null
          id?: string
          original_exercise: string
        }
        Update: {
          alternative_exercise?: string
          body_area?: string
          created_at?: string | null
          description?: string | null
          id?: string
          original_exercise?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          start_date: string | null
          target_days_per_week: number | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          start_date?: string | null
          target_days_per_week?: number | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          start_date?: string | null
          target_days_per_week?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      microblock_templates: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          exercises: Json | null
          id: string
          intensity_level: string | null
          joint_friendly: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          id?: string
          intensity_level?: string | null
          joint_friendly?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          id?: string
          intensity_level?: string | null
          joint_friendly?: boolean | null
          title?: string
        }
        Relationships: []
      }
      pain_reports: {
        Row: {
          body_area: string
          created_at: string | null
          id: string
          intensity: number
          notes: string | null
          report_date: string
          user_id: string
        }
        Insert: {
          body_area: string
          created_at?: string | null
          id?: string
          intensity: number
          notes?: string | null
          report_date?: string
          user_id: string
        }
        Update: {
          body_area?: string
          created_at?: string | null
          id?: string
          intensity?: number
          notes?: string | null
          report_date?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          name: string | null
          reminder_enabled: boolean | null
          subscription_status: string | null
          theme_preference: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          is_premium?: boolean | null
          name?: string | null
          reminder_enabled?: boolean | null
          subscription_status?: string | null
          theme_preference?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string | null
          reminder_enabled?: boolean | null
          subscription_status?: string | null
          theme_preference?: string | null
        }
        Relationships: []
      }
      streak_repairs: {
        Row: {
          created_at: string | null
          days_missed: number | null
          id: string
          repair_date: string
          repair_message: string | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          created_at?: string | null
          days_missed?: number | null
          id?: string
          repair_date?: string
          repair_message?: string | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          created_at?: string | null
          days_missed?: number | null
          id?: string
          repair_date?: string
          repair_message?: string | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          achievement: string | null
          created_at: string
          display_name: string
          id: string
          is_approved: boolean
          location: string | null
          quote: string
          rating: number
          user_id: string
        }
        Insert: {
          achievement?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_approved?: boolean
          location?: string | null
          quote: string
          rating?: number
          user_id: string
        }
        Update: {
          achievement?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_approved?: boolean
          location?: string | null
          quote?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_buddies: {
        Row: {
          buddy_id: string
          created_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          buddy_id: string
          created_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          buddy_id?: string
          created_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
