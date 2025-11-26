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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          content: string
          created_at: string
          id: string
          is_recurring: boolean | null
          parent_content_id: string | null
          platform: string
          recurrence_end_date: string | null
          recurrence_interval: number | null
          recurrence_type: string | null
          scheduled_at: string | null
          status: string
          topic: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_recurring?: boolean | null
          parent_content_id?: string | null
          platform: string
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          scheduled_at?: string | null
          status?: string
          topic: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_recurring?: boolean | null
          parent_content_id?: string | null
          platform?: string
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          scheduled_at?: string | null
          status?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_parent_content_id_fkey"
            columns: ["parent_content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      library_item_categories: {
        Row: {
          category_id: string
          library_item_id: string
        }
        Insert: {
          category_id: string
          library_item_id: string
        }
        Update: {
          category_id?: string
          library_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_item_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_item_categories_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      library_item_tags: {
        Row: {
          library_item_id: string
          tag_id: string
        }
        Insert: {
          library_item_id: string
          tag_id: string
        }
        Update: {
          library_item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_item_tags_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          storage_path: string | null
          thumbnail_path: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          storage_path?: string | null
          thumbnail_path?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          storage_path?: string | null
          thumbnail_path?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          currency: string | null
          id: string
          job_id: string
          price: number
          product_name: string | null
          recorded_at: string
          url: string
        }
        Insert: {
          currency?: string | null
          id?: string
          job_id: string
          price: number
          product_name?: string | null
          recorded_at?: string
          url: string
        }
        Update: {
          currency?: string | null
          id?: string
          job_id?: string
          price?: number
          product_name?: string | null
          recorded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrape_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_jobs: {
        Row: {
          created_at: string
          extract_contacts: boolean | null
          extract_prices: boolean | null
          id: string
          last_run_at: string | null
          name: string | null
          next_run_at: string | null
          query: string
          recurrence_enabled: boolean | null
          recurrence_interval: string | null
          recurrence_time: string | null
          sources: string[] | null
          status: Database["public"]["Enums"]["job_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extract_contacts?: boolean | null
          extract_prices?: boolean | null
          id?: string
          last_run_at?: string | null
          name?: string | null
          next_run_at?: string | null
          query: string
          recurrence_enabled?: boolean | null
          recurrence_interval?: string | null
          recurrence_time?: string | null
          sources?: string[] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          extract_contacts?: boolean | null
          extract_prices?: boolean | null
          id?: string
          last_run_at?: string | null
          name?: string | null
          next_run_at?: string | null
          query?: string
          recurrence_enabled?: boolean | null
          recurrence_interval?: string | null
          recurrence_time?: string | null
          sources?: string[] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scrape_results: {
        Row: {
          ai_sentiment: string | null
          ai_summary: string | null
          contacts: Json | null
          id: string
          job_id: string
          prices: Json | null
          scraped_at: string
          screenshot_path: string | null
          text_content: string | null
          title: string | null
          url: string
        }
        Insert: {
          ai_sentiment?: string | null
          ai_summary?: string | null
          contacts?: Json | null
          id?: string
          job_id: string
          prices?: Json | null
          scraped_at?: string
          screenshot_path?: string | null
          text_content?: string | null
          title?: string | null
          url: string
        }
        Update: {
          ai_sentiment?: string | null
          ai_summary?: string | null
          contacts?: Json | null
          id?: string
          job_id?: string
          prices?: Json | null
          scraped_at?: string
          screenshot_path?: string | null
          text_content?: string | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrape_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          platform: string
          topic: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          platform: string
          topic: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          platform?: string
          topic?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_similar_library_items: {
        Args: {
          exclude_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          created_at: string
          description: string
          id: string
          similarity: number
          storage_path: string
          thumbnail_path: string
          title: string
          type: string
        }[]
      }
    }
    Enums: {
      job_status: "pending" | "running" | "completed" | "failed" | "cancelled"
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
      job_status: ["pending", "running", "completed", "failed", "cancelled"],
    },
  },
} as const
