
-- Add tool connection configurations table
CREATE TABLE tool_connection_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES mcp_tools(id) ON DELETE CASCADE,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('stdio', 'sse')),
  
  -- Stdio configuration
  install_command TEXT,
  run_command TEXT,
  args TEXT[] DEFAULT '{}',
  required_env_vars JSONB DEFAULT '{}', -- {name: description}
  
  -- SSE configuration
  endpoint_url TEXT,
  auth_type TEXT CHECK (auth_type IN ('none', 'bearer', 'api-key', 'oauth')),
  auth_instructions TEXT,
  
  -- Generated configs stored as JSONB
  claude_desktop_config JSONB,
  vscode_config JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tool_id, transport_type)
);

-- RLS policies
ALTER TABLE tool_connection_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Connection configs viewable with tools" ON tool_connection_configs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mcp_tools 
      WHERE id = tool_id 
      AND (is_published = true OR auth.uid() = author_id)
    )
  );

-- Create trigger for updating timestamps
CREATE TRIGGER update_tool_connection_configs_updated_at 
  BEFORE UPDATE ON tool_connection_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the filesystem tool to use real package name
UPDATE mcp_tools 
SET 
  name = '@modelcontextprotocol/server-filesystem',
  slug = 'mcp-server-filesystem',
  repository_url = 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
  install_command = 'npm install -g @modelcontextprotocol/server-filesystem'
WHERE slug = 'file-system-access';

-- Insert real connection config for filesystem server
INSERT INTO tool_connection_configs (tool_id, transport_type, install_command, run_command, args, required_env_vars, claude_desktop_config, vscode_config)
SELECT 
  id,
  'stdio',
  'npm install -g @modelcontextprotocol/server-filesystem',
  'npx',
  ARRAY['-y', '@modelcontextprotocol/server-filesystem'],
  '{}', -- No env vars needed for filesystem
  jsonb_build_object(
    'mcpServers', jsonb_build_object(
      'filesystem', jsonb_build_object(
        'command', 'npx',
        'args', jsonb_build_array('-y', '@modelcontextprotocol/server-filesystem'),
        'env', jsonb_build_object()
      )
    )
  ),
  jsonb_build_object(
    'mcp-servers', jsonb_build_object(
      'filesystem', jsonb_build_object(
        'command', 'npx',
        'args', jsonb_build_array('-y', '@modelcontextprotocol/server-filesystem'),
        'env', jsonb_build_object()
      )
    )
  )
FROM mcp_tools 
WHERE slug = 'mcp-server-filesystem';

-- Add Context7 as an SSE example
UPDATE mcp_tools
SET 
  name = 'Context7',
  transport_types = ARRAY['sse'],
  homepage_url = 'https://context7.io',
  documentation_url = 'https://docs.context7.io'
WHERE slug = 'context7';

-- Insert Context7 SSE connection config
INSERT INTO tool_connection_configs (tool_id, transport_type, endpoint_url, auth_type, auth_instructions, claude_desktop_config)
SELECT 
  id,
  'sse',
  'https://api.context7.io/v1/mcp',
  'api-key',
  'Get your API key from https://context7.io/dashboard',
  jsonb_build_object(
    'mcpServers', jsonb_build_object(
      'context7', jsonb_build_object(
        'url', 'https://api.context7.io/v1/mcp',
        'transport', 'sse',
        'headers', jsonb_build_object(
          'X-API-Key', '${CONTEXT7_API_KEY}'
        )
      )
    )
  )
FROM mcp_tools 
WHERE slug = 'context7';

-- Add GitHub MCP server as another real example (fixed empty array casting)
INSERT INTO tool_connection_configs (tool_id, transport_type, install_command, run_command, args, required_env_vars, claude_desktop_config)
SELECT 
  id,
  'stdio',
  'npm install -g @github/mcp-server',
  'github-mcp-server',
  ARRAY[]::text[], -- Fixed: explicitly cast empty array to text[]
  '{"GITHUB_PERSONAL_ACCESS_TOKEN": "Your GitHub personal access token with appropriate permissions"}',
  jsonb_build_object(
    'mcpServers', jsonb_build_object(
      'github', jsonb_build_object(
        'command', 'github-mcp-server',
        'args', jsonb_build_array(),
        'env', jsonb_build_object(
          'GITHUB_PERSONAL_ACCESS_TOKEN', '${GITHUB_PERSONAL_ACCESS_TOKEN}'
        )
      )
    )
  )
FROM mcp_tools 
WHERE slug = 'github-integration';
