
import { db } from '@/lib/supabase';
import { MCPTool } from '@/types/database';

export interface SearchResult extends MCPTool {
  source: 'Smithery' | 'Official MCP';
  matchScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  sources: string[];
  query: string;
}

// Mock official MCP registry data for now
const OFFICIAL_MCP_TOOLS = [
  {
    id: 'filesystem-mcp',
    name: 'File System',
    description: 'Read and write files on the local filesystem',
    category: 'Development',
    source: 'Official MCP' as const,
    matchScore: 0.9,
    author_id: 'official',
    config_schema: {},
    created_at: new Date().toISOString(),
    documentation_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    downloads: 15420,
    homepage_url: 'https://modelcontextprotocol.io',
    install_command: 'npm install @modelcontextprotocol/server-filesystem',
    is_featured: true,
    is_published: true,
    keywords: ['filesystem', 'files', 'read', 'write'],
    license: 'MIT',
    repository_url: 'https://github.com/modelcontextprotocol/servers',
    slug: 'filesystem-mcp',
    stars: 892,
    tags: ['development', 'files'],
    updated_at: new Date().toISOString(),
    version: '1.0.0'
  },
  {
    id: 'sqlite-mcp',
    name: 'SQLite',
    description: 'Interact with SQLite databases',
    category: 'Database',
    source: 'Official MCP' as const,
    matchScore: 0.8,
    author_id: 'official',
    config_schema: {},
    created_at: new Date().toISOString(),
    documentation_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    downloads: 12100,
    homepage_url: 'https://modelcontextprotocol.io',
    install_command: 'npm install @modelcontextprotocol/server-sqlite',
    is_featured: true,
    is_published: true,
    keywords: ['sqlite', 'database', 'sql'],
    license: 'MIT',
    repository_url: 'https://github.com/modelcontextprotocol/servers',
    slug: 'sqlite-mcp',
    stars: 654,
    tags: ['database', 'sql'],
    updated_at: new Date().toISOString(),
    version: '1.0.0'
  }
];

export const searchRegistries = async (query: string): Promise<SearchResponse> => {
  try {
    // Search Smithery (our Supabase database)
    const { data: smitheryResults, error } = await db.getTools({
      search: query,
      limit: 10
    });

    if (error) {
      console.error('Smithery search error:', error);
    }

    // Search official MCP registry (mock for now)
    const officialResults = OFFICIAL_MCP_TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase()) ||
      tool.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
    );

    // Combine and format results
    const smitheryFormatted: SearchResult[] = (smitheryResults || []).map(tool => ({
      ...tool,
      source: 'Smithery' as const,
      matchScore: calculateMatchScore(tool, query)
    }));

    const officialFormatted: SearchResult[] = officialResults.map(tool => ({
      ...tool,
      source: 'Official MCP' as const,
      matchScore: calculateMatchScore(tool, query)
    }));

    const allResults = [...smitheryFormatted, ...officialFormatted]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // Limit to top 20 results

    return {
      results: allResults,
      totalCount: allResults.length,
      sources: ['Smithery', 'Official MCP'],
      query
    };
  } catch (error) {
    console.error('Registry search error:', error);
    return {
      results: [],
      totalCount: 0,
      sources: [],
      query
    };
  }
};

const calculateMatchScore = (tool: any, query: string): number => {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Exact name match gets highest score
  if (tool.name.toLowerCase() === queryLower) score += 1.0;
  else if (tool.name.toLowerCase().includes(queryLower)) score += 0.8;

  // Description matches
  if (tool.description.toLowerCase().includes(queryLower)) score += 0.6;

  // Keyword matches
  if (tool.keywords?.some((keyword: string) => keyword.toLowerCase().includes(queryLower))) {
    score += 0.4;
  }

  // Category match
  if (tool.category.toLowerCase().includes(queryLower)) score += 0.3;

  return Math.min(score, 1.0);
};

export const extractSearchQuery = (input: string): string => {
  // Extract query from "/search query" or "search servers query"
  if (input.startsWith('/search ')) {
    return input.substring(8).trim();
  }
  if (input.includes('search servers ')) {
    return input.substring(input.indexOf('search servers ') + 15).trim();
  }
  return input.trim();
};
