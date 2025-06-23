
// MCP Registry API integration service
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  repository: {
    url: string;
    source: string;
    id: string;
  };
  version_detail: {
    version: string;
    release_date: string;
    is_latest: boolean;
  };
  packages: Array<{
    registry_name: string;
    name: string;
    version: string;
    package_arguments?: Array<{
      type: string;
      description: string;
      value_hint?: string;
      is_required?: boolean;
    }>;
    environment_variables?: Array<{
      name: string;
      description: string;
      is_required?: boolean;
      is_secret?: boolean;
    }>;
  }>;
}

export interface MCPRegistryResponse {
  servers: MCPServer[];
  metadata: {
    next_cursor?: string;
    count: number;
  };
}

export interface TransformedServer {
  id: string;
  name: string;
  description: string;
  packageName: string;
  source: string;
  version: string;
  repository: {
    url: string;
    source: string;
    id: string;
  };
  packages: Array<{
    registry_name: string;
    name: string;
    version: string;
    package_arguments?: any[];
    environment_variables?: any[];
  }>;
  downloads: string;
}

class MCPRegistryService {
  private readonly baseUrl = 'https://lvpoqyklxclygwggryxo.supabase.co/functions/v1/mcp-registry-proxy';
  
  async searchServers(query?: string, limit: number = 30): Promise<MCPServer[]> {
    try {
      // Get all servers first (registry doesn't have search endpoint)
      const url = new URL(this.baseUrl);
      url.searchParams.set('limit', limit.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Registry API error: ${response.status}`);
      }
      
      const data: MCPRegistryResponse = await response.json();
      
      // Client-side filtering if query provided
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        return data.servers.filter(server => 
          server.name.toLowerCase().includes(searchTerm) ||
          server.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return data.servers;
    } catch (error) {
      console.error('Failed to fetch from MCP Registry:', error);
      throw error;
    }
  }
  
  async getServerById(id: string): Promise<MCPServer | null> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('endpoint', `servers/${id}`);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch server details:', error);
      return null;
    }
  }

  async checkHealth(): Promise<'online' | 'offline'> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('endpoint', 'health');
      
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok' ? 'online' : 'offline';
      }
      return 'offline';
    } catch (error) {
      return 'offline';
    }
  }

  transformServerData(servers: MCPServer[]): TransformedServer[] {
    return servers.map(server => ({
      id: server.id,
      name: server.name,
      description: server.description,
      // Extract primary package name for display
      packageName: server.packages[0]?.name || server.name,
      // Determine source from repository
      source: server.repository.source === 'github' ? 'Official MCP' : 'Community',
      // Use version from version_detail
      version: server.version_detail.version,
      // Add registry-specific data
      repository: server.repository,
      packages: server.packages,
      // For now, set downloads as "N/A" since registry doesn't provide this
      downloads: 'N/A'
    }));
  }
}

export const mcpRegistryService = new MCPRegistryService();
