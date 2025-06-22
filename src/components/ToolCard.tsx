
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, ExternalLink, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MCPTool } from '../types/database';
import { ConnectionSettingsModal } from './ConnectionSettingsModal';

interface ToolCardProps {
  tool: MCPTool & {
    user_profiles?: {
      username: string;
      display_name: string;
      avatar_url: string | null;
    } | null;
    organizations?: {
      name: string;
      slug: string;
    } | null;
  };
  isStarred: boolean;
  onStar: (toolId: string) => void;
  onInstall: () => void;
  onClick?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, isStarred, onStar, onInstall, onClick }) => {
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  return (
    <>
      <Link to={`/tools/${tool.slug}`}>
        <Card className="group hover:shadow-lg transition-all duration-200 bg-white border-gray-200 cursor-pointer h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{tool.name}</h3>
                  {tool.is_verified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                  {tool.is_featured && (
                    <Badge className="text-xs bg-blue-100 text-blue-800">Featured</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {tool.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {tool.downloads?.toLocaleString() || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {tool.stars || 0}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {tool.category}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>v{tool.version}</span>
                <span>•</span>
                <span>MCP {tool.mcp_version}</span>
                {tool.transport_types && (
                  <>
                    <span>•</span>
                    <span>{tool.transport_types.join(', ')}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onStar(tool.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Star 
                    className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                  />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConnectionModal(true);
                  }}
                  className="h-8 w-8 p-0"
                  title="Connection Settings"
                >
                  <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onInstall();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Download className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </Button>
                
                {tool.repository_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a 
                      href={tool.repository_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="View Repository"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            {tool.user_profiles && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>by {tool.user_profiles.display_name || tool.user_profiles.username}</span>
                  {tool.organizations && (
                    <>
                      <span>•</span>
                      <span>{tool.organizations.name}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      <ConnectionSettingsModal
        tool={tool}
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />
    </>
  );
};
