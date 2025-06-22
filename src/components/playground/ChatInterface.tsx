
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, User, Bot, ChevronDown, Zap } from 'lucide-react';
import { MCPTool } from '@/types/database';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolExecutions?: any[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  connectedTools: MCPTool[];
  selectedModel: 'claude-3' | 'gpt-4' | 'local';
  selectedProfile: string;
  onProfileChange: (profile: string) => void;
}

export const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  connectedTools, 
  selectedModel, 
  selectedProfile, 
  onProfileChange 
}: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [showToolSuggestions, setShowToolSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      setShowToolSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Show tool suggestions when typing "/"
    if (value.endsWith('/') && connectedTools.length > 0) {
      setShowToolSuggestions(true);
    } else {
      setShowToolSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertToolMention = (toolName: string) => {
    const newInput = input.replace(/\/$/, `/${toolName} `);
    setInput(newInput);
    setShowToolSuggestions(false);
    textareaRef.current?.focus();
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Messages (only show if there are messages) */}
      {messages.length > 0 && (
        <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Chat Input Container - Smithery Style */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Press / to add tools or simply give the agent a task"
              className="min-h-[60px] bg-gray-800 border-gray-700 text-white resize-none pr-12"
            />
          </div>

          {/* Controls - Match Smithery's Layout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Profile selector - Claude button */}
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-700 text-gray-300 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Claude
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {/* Model selector dropdown */}
              <select 
                value={selectedModel}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="gpt-4">gpt-4.1</option>
                <option value="claude-3">claude-3</option>
                <option value="local">local</option>
              </select>
              
              {/* Third dropdown - Standard */}
              <select className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Standard</option>
                <option>Creative</option>
                <option>Analytical</option>
              </select>
              
              {/* Quick button - match Smithery's "yolo" style */}
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-700 text-gray-300 hover:text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick
              </Button>
            </div>
            
            {/* Send button */}
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Tool Suggestions */}
        {showToolSuggestions && (
          <Card className="absolute bottom-full mb-2 w-full bg-gray-800 border-gray-700 max-h-48 overflow-y-auto z-10">
            <div className="p-2">
              <p className="text-xs text-gray-400 mb-2">Available tools:</p>
              {connectedTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => insertToolMention(tool.name)}
                  className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm text-white"
                >
                  /{tool.name}
                  <span className="text-gray-400 ml-2">- {tool.description}</span>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
