
import React from 'react';
import { ToolCard } from './ToolCard';
import { MCPTool } from '../types/database';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '../lib/supabase';

interface ToolGridProps {
  tools: (MCPTool & {
    user_profiles?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
    organizations?: {
      name: string;
      slug: string;
    } | null;
  })[];
  isLoading?: boolean;
  starredTools?: Set<string>;
  onStarTool?: (toolId: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  isLoading,
  starredTools = new Set(),
  onStarTool,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStarTool = async (toolId: string) => {
    try {
      const { data: { user } } = await auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to star tools",
          variant: "destructive",
        });
        return;
      }

      const isStarred = starredTools.has(toolId);
      
      if (isStarred) {
        await db.unstarTool(toolId, user.id);
      } else {
        await db.starTool(toolId, user.id);
      }

      onStarTool?.(toolId);
      
      toast({
        title: isStarred ? "Tool unstarred" : "Tool starred",
        description: isStarred 
          ? "Removed from your starred tools" 
          : "Added to your starred tools",
      });
    } catch (error) {
      console.error('Error starring tool:', error);
      toast({
        title: "Error",
        description: "Failed to star tool. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInstallTool = async (tool: MCPTool) => {
    try {
      const { data: { user } } = await auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to install tools",
          variant: "destructive",
        });
        return;
      }

      await db.installTool(tool.id, user.id);
      await db.recordDownload(tool.id, user.id);

      toast({
        title: "Tool installed",
        description: `${tool.name} has been added to your tools`,
      });
    } catch (error) {
      console.error('Error installing tool:', error);
      toast({
        title: "Error",
        description: "Failed to install tool. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tools found</h3>
        <p className="text-gray-600">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          isStarred={starredTools.has(tool.id)}
          onStar={() => handleStarTool(tool.id)}
          onInstall={() => handleInstallTool(tool)}
          onClick={() => navigate(`/tools/${tool.slug}`)}
        />
      ))}
    </div>
  );
};
