
import React, { useState, useEffect } from 'react';
import { ToolGrid } from '../components/ToolGrid';
import { ToolRegistryHeader } from '../components/ToolRegistryHeader';
import { ToolFilters } from '../components/ToolFilters';
import { ToolStats } from '../components/ToolStats';
import { CreateToolCTA } from '../components/CreateToolCTA';
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
  const [tools, setTools] = useState<any[]>(sampleTools);
  const [categories, setCategories] = useState<string[]>(['Development', 'Productivity', 'System', 'AI', 'Database']);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeatured, setShowFeatured] = useState(false);
  const [starredTools, setStarredTools] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadTools();
    loadStarredTools();
  }, [searchQuery, selectedCategory, showFeatured]);

  const loadTools = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await db.getTools({
        search: searchQuery || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
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
        
        if (selectedCategory && selectedCategory !== 'all') {
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
      setTools(sampleTools);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStarredTools = async () => {
    try {
      const { data: { user } } = await auth.getUser();
      if (!user) return;

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
    setSelectedCategory('all');
    setShowFeatured(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ToolRegistryHeader />

      <ToolFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        showFeatured={showFeatured}
        setShowFeatured={setShowFeatured}
        onClearFilters={clearFilters}
      />

      <ToolStats toolCount={tools.length} isLoading={isLoading} />

      <ToolGrid
        tools={tools}
        isLoading={isLoading}
        starredTools={starredTools}
        onStarTool={handleStarTool}
      />

      <CreateToolCTA />
    </div>
  );
};
