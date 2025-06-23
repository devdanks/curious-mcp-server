
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus, Check } from 'lucide-react';
import { MCPTool } from '@/types/database';
import { SearchResult, searchRegistries } from '@/services/mcpRegistrySearch';
import { getActiveProfile, addToolToProfile, getProfiles, setActiveProfile } from '@/services/toolboxProfiles';
import { mcpRegistryService, type TransformedServer } from '@/services/mcpRegistryService';

interface DevToolboxProps {
  query: string;
  onConnect: (tool: MCPTool) => void;
  onAddToProfile: (tool: MCPTool, profileId: string) => void;
  isVisible: boolean;
  connectedTools: MCPTool[];
}

export const DevToolbox = ({ 
  query, 
  onConnect, 
  onAddToProfile, 
  isVisible, 
  connectedTools 
}: DevToolboxProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mcpServers, setMcpServers] = useState<TransformedServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(getActiveProfile().id);
  const [profiles] = useState(getProfiles());
  const [registryStatus, setRegistryStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Check registry health on mount
  useEffect(() => {
    const checkRegistryHealth = async () => {
      try {
        const status = await mcpRegistryService.checkHealth();
        setRegistryStatus(status);
      } catch (error) {
        setRegistryStatus('offline');
      }
    };

    checkRegistryHealth();
  }, []);

  useEffect(() => {
    if (query && isVisible) {
      performSearch();
    }
  }, [query, isVisible]);

  const performSearch = async () => {
    setLoading(true);
    setSearchError(null);
    try {
      // Search both Smithery and MCP Registry
      const [smitheryResponse, mcpServerList] = await Promise.all([
        searchRegistries(query),
        mcpRegistryService.searchServers(query, 50)
      ]);

      // Transform MCP servers to match our interface
      const transformedMcpServers = mcpRegistryService.transformServerData(mcpServerList);
      
      setResults(smitheryResponse.results);
      setMcpServers(transformedMcpServers);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Failed to search registry. Please try again.');
      setResults([]);
      setMcpServers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (tool: SearchResult) => {
    onConnect(tool);
    addToolToProfile(tool, selectedProfile);
  };

  const handleConnectMcpServer = (server: TransformedServer) => {
    // Convert MCP server to MCPTool format for connection
    const toolData: MCPTool = {
      id: server.id,
      name: server.name,
      description: server.description,
      long_description: server.description,
      category: 'MCP Server',
      author_id: 'mcp-registry',
      config_schema: {},
      created_at: new Date().toISOString(),
      documentation_url: server.repository.url,
      downloads: 0,
      homepage_url: server.repository.url,
      install_command: server.packageName,
      is_featured: false,
      is_published: true,
      is_verified: true,
      keywords: [],
      license: 'Unknown',
      repository_url: server.repository.url,
      slug: server.id,
      stars: 0,
      tags: [],
      updated_at: new Date().toISOString(),
      version: server.version,
      mcp_version: '1.0.0',
      transport_types: ['stdio'],
      metadata: {
        mcpServer: {
          id: server.id,
          name: server.name,
          description: server.description,
          packageName: server.packageName,
          source: server.source,
          version: server.version,
          downloads: server.downloads
        },
        serverData: {
          repository: server.repository,
          packages: server.packages
        },
        connectedAt: new Date().toISOString()
      },
      organization_id: null
    };

    onConnect(toolData);
    addToolToProfile(toolData, selectedProfile);
  };

  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId);
    setActiveProfile(profileId);
  };

  const isToolConnected = (toolId: string) => {
    return connectedTools.some(tool => tool.id === toolId);
  };

  const totalResults = results.length + mcpServers.length;

  if (!isVisible) return null;

  return (
    <Card className="absolute bottom-full mb-2 w-full bg-gray-800 border-gray-700 max-h-96 overflow-y-auto z-20">
      <div className="p-4">
        {/* Header with count, status, and profile selector */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">
              Found {totalResults} servers
            </span>
            {loading && (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            )}
            
            {/* Registry status indicator */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                registryStatus === 'online' ? 'bg-green-500' : 
                registryStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-gray-400">
                Registry: {registryStatus === 'checking' ? 'Checking...' : registryStatus}
              </span>
            </div>
          </div>
          
          {/* Profile selector */}
          <div className="flex gap-1">
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => handleProfileChange(profile.id)}
                className={`px-2 py-1 text-xs rounded ${
                  selectedProfile === profile.id
                    ? `${profile.color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Searching registry...</p>
          </div>
        )}

        {/* Error state */}
        {searchError && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-3">
            <p className="text-red-400 text-sm">{searchError}</p>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-2">
          {/* MCP Registry Results */}
          {mcpServers.map((server) => (
            <div
              key={`mcp-${server.id}`}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white truncate">
                    {server.name}
                  </h4>
                  <Badge variant="default" className="text-xs bg-green-600">
                    MCP Registry
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                  {server.description}
                </p>
                {server.packageName && (
                  <p className="text-xs text-orange-400 mb-2">Package: {server.packageName}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>v{server.version}</span>
                  <span>•</span>
                  <span>{server.source}</span>
                  {server.repository && (
                    <>
                      <span>•</span>
                      <a
                        href={server.repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-gray-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Repository
                      </a>
                    </>
                  )}
                </div>
              </div>
              
              <div className="ml-3 flex-shrink-0">
                {isToolConnected(server.id) ? (
                  <Button size="sm" variant="outline" disabled>
                    <Check className="w-4 h-4 mr-1" />
                    Connected
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnectMcpServer(server)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Smithery Results */}
          {results.map((result) => (
            <div
              key={`smithery-${result.id}`}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white truncate">
                    {result.name}
                  </h4>
                  <Badge 
                    variant={result.source === 'Smithery' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {result.source}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                  {result.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{result.downloads.toLocaleString()} downloads</span>
                  <span>•</span>
                  <span>{result.stars} stars</span>
                  {result.repository_url && (
                    <>
                      <span>•</span>
                      <a
                        href={result.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-gray-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </a>
                    </>
                  )}
                </div>
              </div>
              
              <div className="ml-3 flex-shrink-0">
                {isToolConnected(result.id) ? (
                  <Button size="sm" variant="outline" disabled>
                    <Check className="w-4 h-4 mr-1" />
                    Connected
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(result)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalResults === 0 && !loading && query && !searchError && (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">No servers found for "{query}"</p>
            <p className="text-xs mt-1">Try different keywords or check the spelling</p>
          </div>
        )}
      </div>
    </Card>
  );
};
