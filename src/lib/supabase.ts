
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Re-export the supabase client
export { supabase };

// Auth helpers
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  getUser: () => supabase.auth.getUser(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
};

// Database helpers
export const db = {
  // Tools
  getTools: (filters?: {
    search?: string;
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    let query = supabase
      .from('mcp_tools')
      .select(`
        *,
        user_profiles!author_id (
          username,
          display_name,
          avatar_url
        ),
        organizations (
          name,
          slug
        )
      `)
      .eq('is_published', true);

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    return query.order('created_at', { ascending: false });
  },

  getTool: (slug: string) =>
    supabase
      .from('mcp_tools')
      .select(`
        *,
        user_profiles!author_id (
          username,
          display_name,
          avatar_url,
          bio
        ),
        organizations (
          name,
          slug,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single(),

  createTool: (tool: Database['public']['Tables']['mcp_tools']['Insert']) =>
    supabase.from('mcp_tools').insert(tool).select().single(),

  updateTool: (id: string, updates: Database['public']['Tables']['mcp_tools']['Update']) =>
    supabase.from('mcp_tools').update(updates).eq('id', id).select().single(),

  // Tool interactions
  starTool: (toolId: string, userId: string) =>
    supabase.from('tool_stars').insert({ tool_id: toolId, user_id: userId }),

  unstarTool: (toolId: string, userId: string) =>
    supabase.from('tool_stars').delete().eq('tool_id', toolId).eq('user_id', userId),

  isToolStarred: (toolId: string, userId: string) =>
    supabase
      .from('tool_stars')
      .select('id')
      .eq('tool_id', toolId)
      .eq('user_id', userId)
      .single(),

  installTool: (toolId: string, userId: string, settings: any = {}) =>
    supabase
      .from('tool_installations')
      .upsert({ tool_id: toolId, user_id: userId, settings, is_active: true })
      .select()
      .single(),

  recordDownload: (toolId: string, userId?: string, ipAddress?: string, userAgent?: string) =>
    supabase.from('tool_downloads').insert({
      tool_id: toolId,
      user_id: userId || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    }),

  // Reviews
  getToolReviews: (toolId: string) =>
    supabase
      .from('tool_reviews')
      .select(`
        *,
        user_profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false }),

  createReview: (review: Database['public']['Tables']['tool_reviews']['Insert']) =>
    supabase.from('tool_reviews').insert(review).select().single(),

  // User profile
  getProfile: (userId: string) =>
    supabase.from('user_profiles').select('*').eq('id', userId).single(),

  updateProfile: (userId: string, updates: Database['public']['Tables']['user_profiles']['Update']) =>
    supabase.from('user_profiles').upsert({ id: userId, ...updates }).select().single(),

  // Categories
  getCategories: () =>
    supabase
      .from('mcp_tools')
      .select('category')
      .eq('is_published', true)
      .then(({ data }) => {
        const categories = [...new Set(data?.map(tool => tool.category) || [])];
        return categories.sort();
      }),
};
