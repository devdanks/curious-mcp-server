
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
      messages: [...prev.messages, userMessage],
    }));

    // Mock assistant response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I understand you said: "${content}". This is a mock response in the playground. With ${state.connectedTools.length} tools connected, I could help you with various tasks!`,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));
    }, 1000);
  };

  const handleCloseBrowser = () => {
    setState(prev => ({ ...prev, showToolBrowser: false }));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PlaygroundHeader 
        connectedToolsCount={state.connectedTools.length}
        selectedModel={state.selectedModel}
        onModelChange={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
      />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <ToolBar 
          connectedTools={state.connectedTools}
          onAddTools={handleAddTools}
          onRemoveTool={handleRemoveTool}
        />
        
        <div className="flex-1 mt-6">
          <ChatInterface 
            messages={state.messages}
            onSendMessage={handleSendMessage}
            connectedTools={state.connectedTools}
            selectedModel={state.selectedModel}
            selectedProfile={state.selectedProfile}
            onProfileChange={(profile) => setState(prev => ({ ...prev, selectedProfile: profile }))}
          />
        </div>
      </div>

      <ToolBrowser 
        isOpen={state.showToolBrowser}
        onClose={handleCloseBrowser}
        onSelectTool={handleSelectTool}
        selectedTools={state.connectedTools.map(tool => tool.id)}
      />
    </div>
  );
};
