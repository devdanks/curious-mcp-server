
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

export const ToolRegistry: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [starredTools, setStarredTools] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadTools();
    loadCategories();
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

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error loading tools:', error);
      toast({
        title: "Error",
        description: "Failed to load tools. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await db.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
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
