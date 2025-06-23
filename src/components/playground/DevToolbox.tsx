
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus, Check } from 'lucide-react';
import { MCPTool } from '@/types/database';
import { SearchResult, searchRegistries } from '@/services/mcpRegistrySearch';
import { getActiveProfile, addToolToProfile, getProfiles, setActiveProfile } from '@/services/toolboxProfiles';

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
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(getActiveProfile().id);
  const [profiles] = useState(getProfiles());

  useEffect(() => {
    if (query && isVisible) {
      performSearch();
    }
  }, [query, isVisible]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResponse = await searchRegistries(query);
      setResults(searchResponse.results);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (tool: SearchResult) => {
    onConnect(tool);
    addToolToProfile(tool, selectedProfile);
  };

  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId);
    setActiveProfile(profileId);
  };

  const isToolConnected = (toolId: string) => {
    return connectedTools.some(tool => tool.id === toolId);
  };

  if (!isVisible) return null;

  return (
    <Card className="absolute bottom-full mb-2 w-full bg-gray-800 border-gray-700 max-h-96 overflow-y-auto z-20">
      <div className="p-4">
        {/* Header with count and profile selector */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              Found {results.length} servers
            </span>
            {loading && (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            )}
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

        {/* Search Results */}
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={`${result.source}-${result.id}`}
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

        {results.length === 0 && !loading && query && (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">No servers found for "{query}"</p>
            <p className="text-xs mt-1">Try different keywords or check the spelling</p>
          </div>
        )}
      </div>
    </Card>
  );
};
