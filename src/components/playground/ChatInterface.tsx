
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot, Settings } from 'lucide-react';
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

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Profile:</span>
              <select 
                value={selectedProfile}
                onChange={(e) => onProfileChange(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="default">Default</option>
                <option value="creative">Creative</option>
                <option value="analytical">Analytical</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Model:</span>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {selectedModel}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready to chat!</h3>
            <p className="text-gray-400 text-sm mb-4">
              Start a conversation with your connected MCP tools.
              {connectedTools.length > 0 && (
                <span className="block mt-2">
                  You have {connectedTools.length} tool{connectedTools.length !== 1 ? 's' : ''} connected.
                </span>
              )}
            </p>
            {connectedTools.length > 0 && (
              <p className="text-xs text-gray-500">
                Type "/" to mention a tool in your message
              </p>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="min-h-[100px] bg-gray-800 border-gray-700 text-white resize-none pr-12"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="absolute bottom-3 right-3 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Tool Suggestions */}
          {showToolSuggestions && (
            <Card className="absolute bottom-full mb-2 w-full bg-gray-800 border-gray-700 max-h-48 overflow-y-auto">
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
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Profile:</span>
            <select 
              value={selectedProfile}
              onChange={(e) => onProfileChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            >
              <option value="default">Default</option>
              <option value="creative">Creative</option>
              <option value="analytical">Analytical</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Model:</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {selectedModel}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
              {message.toolExecutions && message.toolExecutions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.toolExecutions.map((execution, index) => (
                    <Badge key={index} variant="outline" className="border-orange-600 text-orange-400">
                      Used {execution.toolName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-h-[100px] bg-gray-800 border-gray-700 text-white resize-none pr-12"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="absolute bottom-3 right-3 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Tool Suggestions */}
        {showToolSuggestions && (
          <Card className="absolute bottom-full mb-2 w-full bg-gray-800 border-gray-700 max-h-48 overflow-y-auto">
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
