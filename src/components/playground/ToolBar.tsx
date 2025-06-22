
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { MCPTool } from '@/types/database';

interface ToolBarProps {
  connectedTools: MCPTool[];
  onAddTools: () => void;
  onRemoveTool: (toolId: string) => void;
}

export const ToolBar = ({ connectedTools, onAddTools, onRemoveTool }: ToolBarProps) => {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Generate a simple icon based on tool name
  const getToolIcon = (toolName: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 
      'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const colorIndex = toolName.length % colors.length;
    const initial = toolName.charAt(0).toUpperCase();
    
    return (
      <div className={`w-8 h-8 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-bold`}>
        {initial}
      </div>
    );
  };

  if (connectedTools.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-gray-800 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tools connected</h3>
          <p className="text-gray-400 text-sm">
            Connect MCP servers to get started with the playground
          </p>
        </div>
        <Button 
          onClick={onAddTools}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Browse servers
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">Connected Tools</h3>
          <Badge variant="secondary" className="bg-gray-800 text-gray-300">
            {connectedTools.length}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddTools}
          className="border-gray-700 text-gray-300 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add more
        </Button>
      </div>

      {/* Animated Tool Carousel */}
      <div className="relative group">
        <div className="flex gap-2 overflow-hidden max-w-full">
          <div className="flex gap-2 animate-none group-hover:animate-pulse">
            {connectedTools.map((tool, index) => (
              <div
                key={tool.id}
                className="flex-shrink-0 relative"
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="relative">
                  {getToolIcon(tool.name)}
                  
                  {hoveredTool === tool.id && (
                    <Card className="absolute top-10 left-0 z-50 p-3 bg-gray-800 border-gray-700 min-w-64">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{tool.name}</h4>
                          <p className="text-xs text-gray-400">v{tool.version}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveTool(tool.id)}
                          className="text-gray-400 hover:text-red-400 p-1 h-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {tool.description || 'No description available'}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {tool.category}
                        </Badge>
                        {tool.is_verified && (
                          <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated preview on hover */}
        <div className="mt-3 p-3 bg-gray-800 rounded-lg group-hover:animate-pulse">
          <p className="text-xs text-gray-400">
            {connectedTools.length} tool{connectedTools.length !== 1 ? 's' : ''} ready for conversation
          </p>
        </div>
      </div>
    </div>
  );
};
