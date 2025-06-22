
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          avatar_url: string | null;
          website: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          avatar_url?: string | null;
          website?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          avatar_url?: string | null;
          website?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mcp_tools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          long_description: string | null;
          category: string;
          author_id: string;
          organization_id: string | null;
          repository_url: string | null;
          documentation_url: string | null;
          homepage_url: string | null;
          version: string;
          mcp_version: string;
          transport_types: string[];
          downloads: number;
          stars: number;
          is_featured: boolean;
          is_verified: boolean;
          is_published: boolean;
          metadata: any;
          install_command: string | null;
          config_schema: any | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          long_description?: string | null;
          category: string;
          author_id: string;
          organization_id?: string | null;
          repository_url?: string | null;
          documentation_url?: string | null;
          homepage_url?: string | null;
          version?: string;
          mcp_version?: string;
          transport_types?: string[];
          downloads?: number;
          stars?: number;
          is_featured?: boolean;
          is_verified?: boolean;
          is_published?: boolean;
          metadata?: any;
          install_command?: string | null;
          config_schema?: any | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          long_description?: string | null;
          category?: string;
          author_id?: string;
          organization_id?: string | null;
          repository_url?: string | null;
          documentation_url?: string | null;
          homepage_url?: string | null;
          version?: string;
          mcp_version?: string;
          transport_types?: string[];
          downloads?: number;
          stars?: number;
          is_featured?: boolean;
          is_verified?: boolean;
          is_published?: boolean;
          metadata?: any;
          install_command?: string | null;
          config_schema?: any | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      tool_installations: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string;
          settings: any;
          is_active: boolean;
          installed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_id: string;
          settings?: any;
          is_active?: boolean;
          installed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_id?: string;
          settings?: any;
          is_active?: boolean;
          installed_at?: string;
        };
      };
      tool_reviews: {
        Row: {
          id: string;
          tool_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string | null;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          user_id: string;
          rating: number;
          title?: string | null;
          comment?: string | null;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          user_id?: string;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tool_stars: {
        Row: {
          id: string;
          tool_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website: string | null;
          location: string | null;
          company: string | null;
          github_username: string | null;
          twitter_username: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          location?: string | null;
          company?: string | null;
          github_username?: string | null;
          twitter_username?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          location?: string | null;
          company?: string | null;
          github_username?: string | null;
          twitter_username?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type MCPTool = Database['public']['Tables']['mcp_tools']['Row'];
export type MCPToolInsert = Database['public']['Tables']['mcp_tools']['Insert'];
export type MCPToolUpdate = Database['public']['Tables']['mcp_tools']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ToolInstallation = Database['public']['Tables']['tool_installations']['Row'];
export type ToolReview = Database['public']['Tables']['tool_reviews']['Row'];
