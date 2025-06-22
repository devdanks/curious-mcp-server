
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Download, ExternalLink, Shield, Zap } from 'lucide-react';
import { MCPTool } from '../types/database';
import { cn } from '@/lib/utils';

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
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        tool.is_featured && "ring-2 ring-primary/20",
        onClick && "hover:bg-accent/5"
      )}
      onClick={onClick}
    >
      {tool.is_featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Zap className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={tool.user_profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {(authorName.charAt(0) || '?').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg leading-tight flex items-center gap-2">
                {tool.name}
                {tool.is_verified && (
                  <Shield className="w-4 h-4 text-blue-500" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                by {orgName || authorName} • v{tool.version}
              </CardDescription>
            </div>
          </div>
        </div>

        {tool.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {tool.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {tool.category}
          </Badge>
          {tool.transport_types.map((transport) => (
            <Badge key={transport} variant="secondary" className="text-xs">
              {transport}
            </Badge>
          ))}
          {tool.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tool.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{tool.stars.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{tool.downloads.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {tool.repository_url && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(tool.repository_url!, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            variant={isStarred ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onStar?.();
            }}
          >
            <Star className={cn("w-4 h-4 mr-1", isStarred && "fill-current")} />
            {isStarred ? 'Starred' : 'Star'}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onInstall?.();
            }}
          >
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
