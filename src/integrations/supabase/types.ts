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
      mcp_tools: {
        Row: {
          author_id: string | null
          category: string
          config_schema: Json | null
          created_at: string | null
          description: string | null
          documentation_url: string | null
          downloads: number | null
          homepage_url: string | null
          id: string
          install_command: string | null
          is_featured: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          long_description: string | null
          mcp_version: string
          metadata: Json | null
          name: string
          organization_id: string | null
          repository_url: string | null
          slug: string
          stars: number | null
          tags: string[] | null
          transport_types: string[] | null
          updated_at: string | null
          version: string
        }
        Insert: {
          author_id?: string | null
          category: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          downloads?: number | null
          homepage_url?: string | null
          id?: string
          install_command?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          long_description?: string | null
          mcp_version?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          repository_url?: string | null
          slug: string
          stars?: number | null
          tags?: string[] | null
          transport_types?: string[] | null
          updated_at?: string | null
          version?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          downloads?: number | null
          homepage_url?: string | null
          id?: string
          install_command?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          long_description?: string | null
          mcp_version?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          repository_url?: string | null
          slug?: string
          stars?: number | null
          tags?: string[] | null
          transport_types?: string[] | null
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      tool_configurations: {
        Row: {
          created_at: string | null
          default_value: Json | null
          description: string | null
          examples: Json | null
          id: string
          is_required: boolean | null
          name: string
          schema: Json
          tool_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          examples?: Json | null
          id?: string
          is_required?: boolean | null
          name: string
          schema: Json
          tool_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          examples?: Json | null
          id?: string
          is_required?: boolean | null
          name?: string
          schema?: Json
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_configurations_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          ip_address: unknown | null
          tool_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          tool_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          tool_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_downloads_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_installations: {
        Row: {
          id: string
          installed_at: string | null
          is_active: boolean | null
          settings: Json | null
          tool_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          settings?: Json | null
          tool_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          settings?: Json | null
          tool_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_installations_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number | null
          title: string | null
          tool_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          title?: string | null
          tool_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          title?: string | null
          tool_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_stars: {
        Row: {
          created_at: string | null
          id: string
          tool_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tool_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tool_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_stars_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          display_name: string | null
          github_username: string | null
          id: string
          is_verified: boolean | null
          location: string | null
          twitter_username: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          github_username?: string | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          twitter_username?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          github_username?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          twitter_username?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
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
