
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, ExternalLink } from 'lucide-react';
import { MCPTool } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface ToolBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: MCPTool) => void;
  selectedTools: string[];
}

interface ToolBrowserState {
  searchQuery: string;
  selectedTool: MCPTool | null;
  currentPage: number;
}

export const ToolBrowser = ({ isOpen, onClose, onSelectTool, selectedTools }: ToolBrowserProps) => {
  const [state, setState] = useState<ToolBrowserState>({
    searchQuery: '',
    selectedTool: null,
    currentPage: 1,
  });

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['playground-tools', state.searchQuery, state.currentPage],
    queryFn: async () => {
      let query = supabase
        .from('mcp_tools')
        .select('*')
        .eq('is_published', true)
        .order('downloads', { ascending: false })
        .range((state.currentPage - 1) * 12, state.currentPage * 12 - 1);

      if (state.searchQuery) {
        query = query.or(`name.ilike.%${state.searchQuery}%,description.ilike.%${state.searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MCPTool[];
    },
    enabled: isOpen,
  });

  const getToolIcon = (toolName: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 
      'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const colorIndex = toolName.length % colors.length;
    const initial = toolName.charAt(0).toUpperCase();
    
    return (
      <div className={`w-12 h-12 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white font-bold`}>
        {initial}
      </div>
    );
  };

  const handleToolClick = (tool: MCPTool) => {
    setState(prev => ({ ...prev, selectedTool: tool }));
  };

  const handleConnect = () => {
    if (state.selectedTool) {
      onSelectTool(state.selectedTool);
      setState(prev => ({ ...prev, selectedTool: null }));
    }
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, selectedTool: null }));
  };

  const isToolConnected = (toolId: string) => selectedTools.includes(toolId);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setState({ searchQuery: '', selectedTool: null, currentPage: 1 });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-800 text-white overflow-hidden flex flex-col">
        {state.selectedTool ? (
          // Tool Configuration Screen
          <div className="flex flex-col h-full">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              <div className="flex items-start gap-4">
                {getToolIcon(state.selectedTool.name)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DialogTitle className="text-xl">{state.selectedTool.name}</DialogTitle>
                    {state.selectedTool.is_verified && (
                      <Badge className="bg-green-600 text-white">Verified</Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{state.selectedTool.name.toLowerCase()}-mcp</p>
                  <p className="text-gray-300">{state.selectedTool.description}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Usage Statistics</h4>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{state.selectedTool.downloads || 0} downloads</span>
                    <span>{state.selectedTool.stars || 0} stars</span>
                  </div>
                </div>

                {state.selectedTool.long_description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-300 text-sm">{state.selectedTool.long_description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Version:</span>
                      <span className="ml-2 text-white">{state.selectedTool.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="ml-2 text-white">{state.selectedTool.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">MCP Version:</span>
                      <span className="ml-2 text-white">{state.selectedTool.mcp_version}</span>
                    </div>
                    {state.selectedTool.transport_types && (
                      <div>
                        <span className="text-gray-400">Transport:</span>
                        <span className="ml-2 text-white">{state.selectedTool.transport_types.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(state.selectedTool.repository_url || state.selectedTool.homepage_url) && (
                  <div>
                    <h4 className="font-medium mb-2">Links</h4>
                    <div className="flex gap-2">
                      {state.selectedTool.repository_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-gray-700 text-gray-300 hover:text-white"
                        >
                          <a href={state.selectedTool.repository_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Repository
                          </a>
                        </Button>
                      )}
                      {state.selectedTool.homepage_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-gray-700 text-gray-300 hover:text-white"
                        >
                          <a href={state.selectedTool.homepage_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Homepage
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-700 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isToolConnected(state.selectedTool.id)}
                className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
              >
                {isToolConnected(state.selectedTool.id) ? 'Already Connected' : 'Connect'}
              </Button>
            </div>
          </div>
        ) : (
          // Tool Browser Screen
          <div className="flex flex-col h-full">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Browse MCP Servers</DialogTitle>
              <div className="flex items-center gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tools..."
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value, currentPage: 1 }))}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded mb-2" />
                            <div className="h-3 bg-gray-700 rounded w-2/3" />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                      onClick={() => handleToolClick(tool)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          {getToolIcon(tool.name)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white truncate">{tool.name}</h4>
                              {tool.is_verified && (
                                <Badge className="bg-green-600 text-white text-xs">✓</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{tool.name.toLowerCase()}-mcp</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {tool.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {tool.downloads || 0} downloads
                          </span>
                          <Button
                            size="sm"
                            disabled={isToolConnected(tool.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isToolConnected(tool.id)) {
                                onSelectTool(tool);
                              }
                            }}
                          >
                            {isToolConnected(tool.id) ? 'Connected' : 'Connect'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {tools.length > 0 && (
              <div className="flex-shrink-0 flex justify-center gap-2 pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={state.currentPage === 1}
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400 py-2">Page {state.currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tools.length < 12}
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
