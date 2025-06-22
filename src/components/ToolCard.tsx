
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Download, ExternalLink, Verified } from 'lucide-react';
import { MCPTool } from '../types/database';

interface ToolCardProps {
  tool: MCPTool & {
    user_profiles?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
    organizations?: {
      name: string;
      slug: string;
    } | null;
  };
  isStarred?: boolean;
  onStar?: () => void;
  onInstall?: () => void;
  onClick?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isStarred = false,
  onStar,
  onInstall,
  onClick,
}) => {
  const authorName = tool.user_profiles?.display_name || tool.user_profiles?.username || 'Unknown';
  const orgName = tool.organizations?.name;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold truncate">{tool.name}</CardTitle>
              {tool.is_verified && (
                <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
              {tool.is_featured && (
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={tool.user_profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">
            {orgName ? `${orgName} • ${authorName}` : authorName}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">
            {tool.category}
          </Badge>
          {tool.transport_types?.map((transport) => (
            <Badge key={transport} variant="outline" className="text-xs">
              {transport}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{tool.downloads || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{tool.stars || 0}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStar?.();
          }}
          className="flex-1"
        >
          <Star className={`w-4 h-4 mr-1 ${isStarred ? 'fill-current' : ''}`} />
          {isStarred ? 'Starred' : 'Star'}
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onInstall?.();
          }}
          className="flex-1"
        >
          Install
        </Button>
        {tool.repository_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(tool.repository_url!, '_blank');
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
