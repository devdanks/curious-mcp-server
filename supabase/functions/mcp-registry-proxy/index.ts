
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const endpoint = searchParams.get('endpoint') || 'servers';
    
    // Remove our custom endpoint param before proxying
    searchParams.delete('endpoint');
    
    let registryUrl: string;
    
    if (endpoint === 'health') {
      registryUrl = 'https://registry.modelcontextprotocol.io/v0/health';
    } else {
      // Default to servers endpoint
      registryUrl = `https://registry.modelcontextprotocol.io/v0/servers${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    }

    console.log('Proxying request to:', registryUrl);

    const response = await fetch(registryUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-Registry-Proxy/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Registry API error: ${response.status} ${response.statusText}`);
      throw new Error(`Registry API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Registry response received, servers count:', data.servers?.length || 0);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
