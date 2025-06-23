
import { useState, useEffect } from 'react';
import { MCPTool } from '@/types/database';
import { PlaygroundHeader } from '@/components/playground/PlaygroundHeader';
import { ToolBar } from '@/components/playground/ToolBar';
import { ChatInterface } from '@/components/playground/ChatInterface';
import { ToolBrowser } from '@/components/playground/ToolBrowser';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolExecutions?: any[];
  timestamp: Date;
}

interface PlaygroundState {
  connectedTools: MCPTool[];
  messages: Message[];
  showToolBrowser: boolean;
  selectedProfile: string;
  selectedModel: 'claude-3' | 'gpt-4' | 'local';
}

export const Playground = () => {
  const [state, setState] = useState<PlaygroundState>({
    connectedTools: [],
    messages: [],
    showToolBrowser: false,
    selectedProfile: 'default',
    selectedModel: 'claude-3',
  });

  // Load connected tools from localStorage on mount
  useEffect(() => {
    const savedTools = localStorage.getItem('playground_tools');
    const savedMessages = localStorage.getItem('playground_messages');
    
    if (savedTools) {
      try {
        const tools = JSON.parse(savedTools);
        setState(prev => ({ ...prev, connectedTools: tools }));
      } catch (error) {
        console.error('Failed to load saved tools:', error);
      }
    }

    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        setState(prev => ({ ...prev, messages }));
      } catch (error) {
        console.error('Failed to load saved messages:', error);
      }
    }
  }, []);

  // Save connected tools to localStorage when they change
  useEffect(() => {
    localStorage.setItem('playground_tools', JSON.stringify(state.connectedTools));
  }, [state.connectedTools]);

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('playground_messages', JSON.stringify(state.messages));
  }, [state.messages]);

  const handleAddTools = () => {
    setState(prev => ({ ...prev, showToolBrowser: true }));
  };

  const handleSelectTool = (tool: MCPTool) => {
    setState(prev => ({
      ...prev,
      connectedTools: [...prev.connectedTools, tool],
      showToolBrowser: false,
    }));
  };

  const handleRemoveTool = (toolId: string) => {
    setState(prev => ({
      ...prev,
      connectedTools: prev.connectedTools.filter(tool => tool.id !== toolId),
    }));
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMessage] 
    }));

    // Enhanced mock response that mentions connected tools
    setTimeout(() => {
      let responseContent = `I understand you said: "${content}".`;
      
      if (content.includes('Connected ') && content.includes('from registry')) {
        responseContent = `Great! I've successfully connected the new tool. With ${state.connectedTools.length + 1} tools now available, I can help you with even more tasks. What would you like me to do with your enhanced toolbox?`;
      } else if (state.connectedTools.length > 0) {
        responseContent += ` With ${state.connectedTools.length} tools connected (${state.connectedTools.map(t => t.name).join(', ')}), I'm ready to help you with various tasks!`;
      } else {
        responseContent += ` This is a mock response in the playground. Try typing "search servers" to find and connect tools from the registry!`;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, assistantMessage] 
      }));
    }, 1000);
  };

  const handleCloseBrowser = () => {
    setState(prev => ({ ...prev, showToolBrowser: false }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PlaygroundHeader 
        connectedToolsCount={state.connectedTools.length}
        selectedModel={state.selectedModel}
        onModelChange={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
      />
      
      {/* Main content - match Smithery's centered layout */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tool Carousel - ALWAYS VISIBLE as primary feature */}
        <ToolBar 
          connectedTools={state.connectedTools}
          onAddTools={handleAddTools}
          onRemoveTool={handleRemoveTool}
        />
        
        {/* Chat Interface - streamlined, no separate sections */}
        <div className="mt-8">
          <ChatInterface 
            messages={state.messages}
            onSendMessage={handleSendMessage}
            connectedTools={state.connectedTools}
            selectedModel={state.selectedModel}
            selectedProfile={state.selectedProfile}
            onProfileChange={(profile) => setState(prev => ({ ...prev, selectedProfile: profile }))}
          />
        </div>
      </main>

      <ToolBrowser 
        isOpen={state.showToolBrowser}
        onClose={handleCloseBrowser}
        onSelectTool={handleSelectTool}
        selectedTools={state.connectedTools.map(tool => tool.id)}
      />
    </div>
  );
};
