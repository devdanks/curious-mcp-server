
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Download, ExternalLink, Settings, Users, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/supabase';
import { ConnectionSettingsModal } from '@/components/ConnectionSettingsModal';
import { ToolReviews } from '@/components/ToolReviews';
import { SimilarTools } from '@/components/SimilarTools';
import { ConfigurationRequirements } from '@/components/ConfigurationRequirements';
import { toast } from 'sonner';
import { MCPTool } from '@/types/database';

interface ToolWithRelations extends MCPTool {
  user_profiles?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  } | null;
  organizations?: {
    name: string;
    slug: string;
    avatar_url?: string | null;
  } | null;
}

export const ToolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const { data: tool, isLoading, error } = useQuery({
    queryKey: ['tool', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Tool slug is required');
      const { data, error } = await db.getTool(slug);
      if (error) throw error;
      return data as ToolWithRelations;
    },
    enabled: !!slug,
  });

  const handleStar = async () => {
    if (!tool) return;
    try {
      // This would need authentication - for now just update UI
      setIsStarred(!isStarred);
      toast.success(isStarred ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleInstall = async () => {
    if (!tool) return;
    try {
      // Record download
      await db.recordDownload(tool.id);
      toast.success('Installation guide opened');
      setShowConnectionModal(true);
    } catch (error) {
      console.error('Error recording download:', error);
      setShowConnectionModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool not found</h1>
          <p className="text-gray-600 mb-4">The tool you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Section */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                        {tool.is_verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                        {tool.is_featured && (
                          <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                        )}
                      </div>
                      
                      <p className="text-lg text-gray-600 mb-6">{tool.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {tool.downloads?.toLocaleString() || 0} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {tool.stars || 0} stars
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          v{tool.version}
                        </span>
                        <Badge variant="outline">{tool.category}</Badge>
                        {tool.transport_types && (
                          <Badge variant="outline">
                            {tool.transport_types.join(', ')}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button 
                          size="lg" 
                          onClick={() => setShowConnectionModal(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Settings className="w-5 h-5 mr-2" />
                          Get Started
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={handleStar}
                        >
                          <Star className={`w-5 h-5 mr-2 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          {isStarred ? 'Starred' : 'Star'}
                        </Button>

                        {tool.repository_url && (
                          <Button variant="outline" size="lg" asChild>
                            <a href={tool.repository_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-5 h-5 mr-2" />
                              Repository
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Requirements */}
              <ConfigurationRequirements tool={tool} />

              {/* Long Description / Documentation */}
              {tool.long_description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{tool.long_description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <ToolReviews toolId={tool.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Info */}
              {tool.user_profiles && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Author</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {tool.user_profiles.avatar_url && (
                        <img 
                          src={tool.user_profiles.avatar_url} 
                          alt={tool.user_profiles.display_name || tool.user_profiles.username || ''} 
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {tool.user_profiles.display_name || tool.user_profiles.username}
                        </p>
                        {tool.user_profiles.bio && (
                          <p className="text-sm text-gray-600">{tool.user_profiles.bio}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleInstall}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Tool
                  </Button>
                  
                  {tool.documentation_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  )}
                  
                  {tool.homepage_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={tool.homepage_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Homepage
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Tool Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-medium">{tool.downloads?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stars</span>
                    <span className="font-medium">{tool.stars || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium">v{tool.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MCP Version</span>
                    <span className="font-medium">{tool.mcp_version}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Tools */}
              <SimilarTools currentTool={tool} />
            </div>
          </div>
        </div>
      </div>

      <ConnectionSettingsModal
        tool={tool}
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />
    </>
  );
};
