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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bible_verses: {
        Row: {
          book: string
          chapter: number
          embedding: string | null
          fts: unknown
          id: string
          text: string
          verse_number: number
        }
        Insert: {
          book: string
          chapter: number
          embedding?: string | null
          fts?: unknown
          id?: string
          text: string
          verse_number: number
        }
        Update: {
          book?: string
          chapter?: number
          embedding?: string | null
          fts?: unknown
          id?: string
          text?: string
          verse_number?: number
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string
          themes: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response: string
          themes?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string
          themes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      cross_references: {
        Row: {
          from_verse: string
          id: string
          to_verse: string
          weight: number | null
        }
        Insert: {
          from_verse: string
          id?: string
          to_verse: string
          weight?: number | null
        }
        Update: {
          from_verse?: string
          id?: string
          to_verse?: string
          weight?: number | null
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string | null
          emotion: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emotion: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emotion?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_journal: {
        Row: {
          created_at: string
          emotion: string
          id: string
          prayer_text: string
          reflection: string | null
          user_id: string
          verse_reference: string
        }
        Insert: {
          created_at?: string
          emotion: string
          id?: string
          prayer_text: string
          reflection?: string | null
          user_id: string
          verse_reference: string
        }
        Update: {
          created_at?: string
          emotion?: string
          id?: string
          prayer_text?: string
          reflection?: string | null
          user_id?: string
          verse_reference?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_devotionals: {
        Row: {
          created_at: string | null
          days_count: number
          devotional_json: Json
          id: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_count: number
          devotional_json: Json
          id?: string
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_count?: number
          devotional_json?: Json
          id?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_verses: {
        Row: {
          created_at: string
          id: string
          note: string | null
          theme: string | null
          user_id: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          theme?: string | null
          user_id: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          theme?: string | null
          user_id?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          id: string
          note_text: string
          verse_reference: string
        }
        Insert: {
          id?: string
          note_text: string
          verse_reference: string
        }
        Update: {
          id?: string
          note_text?: string
          verse_reference?: string
        }
        Relationships: []
      }
      user_memories: {
        Row: {
          concerns: string[] | null
          confidence: number | null
          created_at: string
          first_seen_at: string | null
          frequency: number
          id: string
          last_seen_at: string | null
          note: string | null
          source_type: string | null
          spiritual_goals: string[] | null
          theme: string
          updated_at: string
          user_id: string
          verse_reference: string
        }
        Insert: {
          concerns?: string[] | null
          confidence?: number | null
          created_at?: string
          first_seen_at?: string | null
          frequency?: number
          id?: string
          last_seen_at?: string | null
          note?: string | null
          source_type?: string | null
          spiritual_goals?: string[] | null
          theme: string
          updated_at?: string
          user_id: string
          verse_reference: string
        }
        Update: {
          concerns?: string[] | null
          confidence?: number | null
          created_at?: string
          first_seen_at?: string | null
          frequency?: number
          id?: string
          last_seen_at?: string | null
          note?: string | null
          source_type?: string | null
          spiritual_goals?: string[] | null
          theme?: string
          updated_at?: string
          user_id?: string
          verse_reference?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_verses: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          book: string
          chapter: number
          id: string
          similarity: number
          text: string
          verse_number: number
        }[]
      }
      search_verses: {
        Args: { match_count?: number; query: string }
        Returns: {
          book: string
          chapter: number
          id: string
          rank: number
          text: string
          verse_number: number
        }[]
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
