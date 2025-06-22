
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MCPTool } from '@/types/database';

interface ToolBarProps {
  connectedTools: MCPTool[];
  onAddTools: () => void;
  onRemoveTool: (toolId: string) => void;
}

// Sample tools for empty state (mirror Smithery's exact tools)
const SAMPLE_TOOLS = [
  { id: 'exa', name: 'Exa AI', iconUrl: '/icons/exa.png' },
  { id: 'ddg', name: 'DuckDuckGo', iconUrl: '/icons/duckduckgo.png' },
  { id: 'github', name: 'GitHub', iconUrl: '/icons/github.png' },
  { id: 'mem0', name: 'Mem0', iconUrl: '/icons/mem0.png' },
  { id: 'neon', name: 'Neon', iconUrl: '/icons/neon.png' },
  { id: 'tavily', name: 'Tavily', iconUrl: '/icons/tavily.png' },
  { id: 'hyperbrowser', name: 'Hyperbrowser', iconUrl: '/icons/hyperbrowser.png' },
  { id: 'slack', name: 'Slack', iconUrl: '/icons/slack.png' },
];

export const ToolBar = ({ connectedTools, onAddTools, onRemoveTool }: ToolBarProps) => {
  // Generate a simple icon based on tool name
  const getToolIcon = (toolName: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 
      'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const colorIndex = toolName.length % colors.length;
    const initial = toolName.charAt(0).toUpperCase();
    
    return (
      <div className={`w-6 h-6 rounded ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {initial}
      </div>
    );
  };

  // Use connected tools if available, otherwise show sample tools
  const displayTools = connectedTools.length > 0 ? connectedTools : SAMPLE_TOOLS;
  
  // Double the tools for infinite scroll effect
  const scrollingTools = [...displayTools, ...displayTools];

  return (
    <div className="mb-6">
      <button 
        onClick={onAddTools}
        className="group relative flex items-center gap-3 bg-gray-800 hover:bg-gray-700 
                   border border-gray-700 rounded-lg px-4 py-3 transition-all duration-200
                   min-h-[60px] w-full max-w-2xl mx-auto cursor-pointer"
      >
        {/* Plus icon */}
        <div className="flex-shrink-0">
          <Plus className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* Tool icons container with horizontal scroll */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex gap-2 animate-scroll group-hover:animate-pause">
            {scrollingTools.map((tool, i) => (
              <div key={`${tool.id}-${i}`}>
                {tool.iconUrl ? (
                  <img
                    src={tool.iconUrl}
                    alt={tool.name}
                    className="w-6 h-6 rounded flex-shrink-0"
                    onError={(e) => {
                      // Fallback to generated icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={tool.iconUrl ? 'hidden' : ''}>
                  {getToolIcon(tool.name)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add to profile text */}
        <span className="text-sm text-gray-400 flex-shrink-0">
          Add to profile
        </span>
      </button>
    </div>
  );
};
