
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, Code, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlaygroundHeaderProps {
  connectedToolsCount: number;
  selectedModel: 'claude-3' | 'gpt-4' | 'local';
  onModelChange: (model: 'claude-3' | 'gpt-4' | 'local') => void;
}

export const PlaygroundHeader = ({ 
  connectedToolsCount, 
  selectedModel, 
  onModelChange 
}: PlaygroundHeaderProps) => {
  const handleGetCode = () => {
    // Mock code generation - would generate actual MCP config
    const config = {
      mcpVersion: "2024-11-05",
      tools: connectedToolsCount,
      model: selectedModel,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Generated config:', config);
    // TODO: Show modal with actual configuration code
  };

  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Playground</h1>
            <Badge variant="secondary" className="bg-orange-600 text-white text-xs">
              BETA
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGetCode}
            disabled={connectedToolsCount === 0}
            className="border-gray-700 text-gray-300 hover:text-white"
          >
            <Code className="w-4 h-4 mr-2" />
            Get code
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
};
