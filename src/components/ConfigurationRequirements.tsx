
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { MCPTool } from '@/types/database';

interface ConfigurationRequirementsProps {
  tool: MCPTool;
}

export const ConfigurationRequirements: React.FC<ConfigurationRequirementsProps> = ({ tool }) => {
  const hasStdio = tool.transport_types?.includes('stdio');
  const hasSSE = tool.transport_types?.includes('sse');
  
  const requirements = [];
  
  if (hasStdio) {
    requirements.push({
      type: 'stdio',
      title: 'Standard Installation',
      description: 'Requires local installation via npm/pip',
      items: [
        'Node.js 16+ or compatible runtime',
        'Package manager (npm, yarn, etc.)',
        'Command line access'
      ]
    });
  }
  
  if (hasSSE) {
    requirements.push({
      type: 'sse',
      title: 'Server Connection',
      description: 'Connects to remote server via API',
      items: [
        'Internet connection',
        'API key or authentication',
        'Compatible MCP client'
      ]
    });
  }

  if (requirements.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Configuration Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {requirements.map((req) => (
          <div key={req.type} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={req.type === 'stdio' ? 'default' : 'secondary'}>
                {req.type === 'stdio' ? 'Local' : 'Remote'}
              </Badge>
              <h3 className="font-medium text-gray-900">{req.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{req.description}</p>
            <ul className="space-y-1">
              {req.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        {tool.transport_types && tool.transport_types.length > 1 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This tool supports multiple connection types. Choose the one that best fits your setup.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
