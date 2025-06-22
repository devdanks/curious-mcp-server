
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Sparkles } from 'lucide-react';
import { ToolGrid } from '../components/ToolGrid';
import { MCPTool } from '../types/database';
import { db, auth } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Sample data for development
const sampleTools = [
  {
    id: '1',
    name: 'GitHub Integration',
    slug: 'github-integration',
    description: 'Complete GitHub API integration for managing repositories, issues, and pull requests',
    category: 'Development',
    author_id: '1',
    version: '1.2.0',
    mcp_version: '0.9.0',
    transport_types: ['stdio', 'sse'],
    downloads: 1543,
    stars: 89,
    is_featured: true,
    is_verified: true,
    is_published: true,
    repository_url: 'https://github.com/example/mcp-github',
    documentation_url: 'https://docs.example.com/mcp-github',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:22:00Z',
    user_profiles: {
      username: 'octodev',
      display_name: 'Octo Developer',
      avatar_url: null
    },
    organizations: {
      name: 'GitHub Tools',
      slug: 'github-tools'
    }
  },
  {
    id: '2',
    name: 'Notion Database Manager',
    slug: 'notion-database',
    description: 'Manage Notion databases, pages, and blocks through MCP',
    category: 'Productivity',
    author_id: '2',
    version: '0.8.5',
    mcp_version: '0.9.0',
    transport_types: ['stdio'],
    downloads: 892,
    stars: 45,
    is_featured: false,
    is_verified: true,
    is_published: true,
    repository_url: 'https://github.com/example/mcp-notion',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T11:30:00Z',
    user_profiles: {
      username: 'notiondev',
      display_name: 'Notion Builder',
      avatar_url: null
    },
    organizations: null
  },
  {
    id: '3',
    name: 'File System Tool',
    slug: 'filesystem-tool',
    description: 'Safe file system operations with permissions and validation',
    category: 'System',
    author_id: '3',
    version: '2.1.0',
    mcp_version: '0.9.0',
    transport_types: ['stdio', 'sse'],
    downloads: 2156,
    stars: 124,
    is_featured: true,
    is_verified: true,
    is_published: true,
    repository_url: 'https://github.com/example/mcp-filesystem',
    created_at: '2024-01-05T16:45:00Z',
    updated_at: '2024-01-22T08:12:00Z',
    user_profiles: {
      username: 'sysadmin',
      display_name: 'System Administrator',
      avatar_url: null
    },
    organizations: null
  }
];

export const ToolRegistry: React.FC = () => {
  const [tools, setTools] = useState<any[]>(sampleTools);  // Start with sample data
  const [categories, setCategories] = useState<string[]>(['Development', 'Productivity', 'System', 'AI', 'Database']);
  const [isLoading, setIsLoading] = useState(false);  // Don't start loading since we have sample data
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [starredTools, setStarredTools] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    // Try to load real tools, but fall back to sample data
    loadTools();
    loadStarredTools();
  }, [searchQuery, selectedCategory, showFeatured]);

  const loadTools = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await db.getTools({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        featured: showFeatured || undefined,
        limit: 50,
      });

      if (error) {
        console.log('Using sample data since Supabase is not connected');
        // Filter sample data based on current filters
        let filteredTools = [...sampleTools];
        
        if (searchQuery) {
          filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (selectedCategory) {
          filteredTools = filteredTools.filter(tool => tool.category === selectedCategory);
        }
        
        if (showFeatured) {
          filteredTools = filteredTools.filter(tool => tool.is_featured);
        }
        
        setTools(filteredTools);
      } else {
        setTools(data || []);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      // Use sample data as fallback
      setTools(sampleTools);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStarredTools = async () => {
    try {
      const { data: { user } } = await auth.getUser();
      if (!user) return;

      // This would need to be implemented in the db helper
      // For now, we'll use an empty set
      setStarredTools(new Set());
    } catch (error) {
      console.error('Error loading starred tools:', error);
    }
  };

  const handleStarTool = (toolId: string) => {
    setStarredTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowFeatured(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory || showFeatured;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MCP Tool Registry
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover and install Model Context Protocol tools to extend your AI applications
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showFeatured ? "default" : "outline"}
              onClick={() => setShowFeatured(!showFeatured)}
              className="whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Featured
            </Button>

            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary">
                Search: "{searchQuery}"
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary">
                Category: {selectedCategory}
              </Badge>
            )}
            {showFeatured && (
              <Badge variant="secondary">
                Featured only
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 text-sm text-gray-600">
        {isLoading ? (
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
        ) : (
          `Showing ${tools.length} tool${tools.length !== 1 ? 's' : ''}`
        )}
      </div>

      {/* Tools Grid */}
      <ToolGrid
        tools={tools}
        isLoading={isLoading}
        starredTools={starredTools}
        onStarTool={handleStarTool}
      />

      {/* Create Tool CTA */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Create Your Own MCP Tool
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your custom tools with the community and help extend the capabilities of AI applications worldwide.
          </p>
          <Button size="lg" className="font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Create Tool
          </Button>
        </div>
      </div>
    </div>
  );
};
