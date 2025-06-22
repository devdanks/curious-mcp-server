
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MCPTool } from '@/types/database';
import { db } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface SimilarToolsProps {
  currentTool: MCPTool;
}

export const SimilarTools: React.FC<SimilarToolsProps> = ({ currentTool }) => {
  const { data: similarTools, isLoading } = useQuery({
    queryKey: ['similar-tools', currentTool.category, currentTool.id],
    queryFn: async () => {
      const { data, error } = await db.getTools({
        category: currentTool.category,
        limit: 4,
      });
      if (error) throw error;
      // Filter out the current tool and limit to 3
      return (data || []).filter(tool => tool.id !== currentTool.id).slice(0, 3);
    },
  });

  if (isLoading || !similarTools || similarTools.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Similar Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {similarTools.map((tool) => (
          <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">{tool.name}</h4>
              <Badge variant="outline" className="text-xs">
                {tool.category}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {tool.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{tool.downloads?.toLocaleString() || 0} downloads</span>
                <span>{tool.stars || 0} stars</span>
              </div>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/tools/${tool.slug}`}>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/?category=${encodeURIComponent(currentTool.category)}`}>
            View All {currentTool.category} Tools
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
