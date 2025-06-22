
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Download, Settings, AlertTriangle, ExternalLink } from 'lucide-react';
import { MCPTool, ToolConnectionConfig } from '../types/database';
import { db } from '../lib/supabase';
import { toast } from 'sonner';

interface ConnectionSettingsModalProps {
  tool: MCPTool;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionSettingsModal: React.FC<ConnectionSettingsModalProps> = ({
  tool,
  isOpen,
  onClose,
}) => {
  const [connectionConfigs, setConnectionConfigs] = useState<ToolConnectionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string>('');

  useEffect(() => {
    if (isOpen && tool.id) {
      loadConnectionConfigs();
    }
  }, [isOpen, tool.id]);

  const loadConnectionConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.getToolConnectionConfigs(tool.id);
      
      if (error) {
        console.error('Error loading connection configs:', error);
        toast.error('Failed to load connection configurations');
        return;
      }

      setConnectionConfigs(data || []);
    } catch (error) {
      console.error('Error loading connection configs:', error);
      toast.error('Failed to load connection configurations');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      toast.success(`${itemName} copied to clipboard`);
      setTimeout(() => setCopiedItem(''), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getInstallMethod = (tool: MCPTool) => {
    if (tool.install_command?.includes('npm')) return 'npm';
    if (tool.install_command?.includes('docker')) return 'docker';
    return 'binary';
  };

  const renderStdioConfig = (config: ToolConnectionConfig) => {
    const installCommand = config.install_command || `npm install -g ${tool.name}`;
    const runCommand = config.run_command || 'npx';
    const args = config.args || [];
    const envVars = config.required_env_vars || {};
    const claudeConfig = config.claude_desktop_config;
    const vscodeConfig = config.vscode_config;

    return (
      <div className="space-y-6">
        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Installation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">1. Install the MCP server</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(installCommand, 'Install command')}
                  className="h-8 px-2"
                >
                  {copiedItem === 'Install command' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono overflow-x-auto">
                {installCommand}
              </pre>
            </div>

            {Object.keys(envVars).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">2. Set environment variables</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(
                      Object.entries(envVars).map(([key, desc]) => `export ${key}="your-${key.toLowerCase()}"`).join('\n'),
                      'Environment variables'
                    )}
                    className="h-8 px-2"
                  >
                    {copiedItem === 'Environment variables' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(envVars).map(([key, description]) => (
                    <div key={key}>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono">
                        export {key}="your-{key.toLowerCase()}"
                      </pre>
                      <p className="text-xs text-gray-500 mt-1">{description as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claude Desktop Configuration */}
        {claudeConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Claude Desktop Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Add to claude_desktop_config.json</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(claudeConfig, null, 2), 'Claude Desktop config')}
                  className="h-8 px-2"
                >
                  {copiedItem === 'Claude Desktop config' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto max-h-64">
                {JSON.stringify(claudeConfig, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* VS Code Configuration */}
        {vscodeConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                VS Code Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Add to settings.json</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(vscodeConfig, null, 2), 'VS Code config')}
                  className="h-8 px-2"
                >
                  {copiedItem === 'VS Code config' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto max-h-64">
                {JSON.stringify(vscodeConfig, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSSEConfig = (config: ToolConnectionConfig) => {
    const claudeConfig = config.claude_desktop_config;
    const authInstructions = config.auth_instructions;

    return (
      <div className="space-y-6">
        {/* Authentication */}
        {authInstructions && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Authentication Required:</strong> {authInstructions}
            </AlertDescription>
          </Alert>
        )}

        {/* Claude Desktop Configuration */}
        {claudeConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Claude Desktop Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Add to claude_desktop_config.json</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(claudeConfig, null, 2), 'Claude Desktop SSE config')}
                  className="h-8 px-2"
                >
                  {copiedItem === 'Claude Desktop SSE config' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto max-h-64">
                {JSON.stringify(claudeConfig, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">Server-Sent Events</Badge>
              <span className="text-gray-400">No local installation required</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const stdioConfigs = connectionConfigs.filter(config => config.transport_type === 'stdio');
  const sseConfigs = connectionConfigs.filter(config => config.transport_type === 'sse');

  const availableTabs = [];
  if (stdioConfigs.length > 0) availableTabs.push('stdio');
  if (sseConfigs.length > 0) availableTabs.push('sse');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            Connection Settings - {tool.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : connectionConfigs.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connection configurations available</h3>
            <p className="text-gray-500 mb-4">
              This tool doesn't have predefined connection settings yet.
            </p>
            {tool.repository_url && (
              <Button variant="outline" asChild>
                <a href={tool.repository_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Documentation
                </a>
              </Button>
            )}
          </div>
        ) : (
          <Tabs defaultValue={availableTabs[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {stdioConfigs.length > 0 && (
                <TabsTrigger value="stdio" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Standard (stdio)
                </TabsTrigger>
              )}
              {sseConfigs.length > 0 && (
                <TabsTrigger value="sse" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Server (SSE)
                </TabsTrigger>
              )}
            </TabsList>

            {stdioConfigs.length > 0 && (
              <TabsContent value="stdio">
                {renderStdioConfig(stdioConfigs[0])}
              </TabsContent>
            )}

            {sseConfigs.length > 0 && (
              <TabsContent value="sse">
                {renderSSEConfig(sseConfigs[0])}
              </TabsContent>
            )}
          </Tabs>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-4">
            {tool.documentation_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentation
                </a>
              </Button>
            )}
            {tool.repository_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={tool.repository_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Repository
                </a>
              </Button>
            )}
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
