
import { Database } from '@/integrations/supabase/types';

// Re-export the main Database type from Supabase
export type { Database };

// Export commonly used types
export type MCPTool = Database['public']['Tables']['mcp_tools']['Row'];
export type MCPToolInsert = Database['public']['Tables']['mcp_tools']['Insert'];
export type MCPToolUpdate = Database['public']['Tables']['mcp_tools']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ToolInstallation = Database['public']['Tables']['tool_installations']['Row'];
export type ToolReview = Database['public']['Tables']['tool_reviews']['Row'];
