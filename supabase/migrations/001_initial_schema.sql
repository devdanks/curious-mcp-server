
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP Tools registry
CREATE TABLE mcp_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  repository_url TEXT,
  documentation_url TEXT,
  homepage_url TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  mcp_version TEXT NOT NULL DEFAULT '1.0.0',
  transport_types TEXT[] DEFAULT ARRAY['stdio'],
  downloads INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  install_command TEXT,
  config_schema JSONB,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool configurations and parameters
CREATE TABLE tool_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES mcp_tools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  examples JSONB DEFAULT '[]',
  is_required BOOLEAN DEFAULT FALSE,
  default_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User tool installations
CREATE TABLE tool_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES mcp_tools(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Tool reviews and ratings
CREATE TABLE tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES mcp_tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Tool stars (like GitHub stars)
CREATE TABLE tool_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES mcp_tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Tool download tracking
CREATE TABLE tool_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES mcp_tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extending Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  location TEXT,
  company TEXT,
  github_username TEXT,
  twitter_username TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tools_author ON mcp_tools(author_id);
CREATE INDEX idx_tools_category ON mcp_tools(category);
CREATE INDEX idx_tools_featured ON mcp_tools(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_tools_published ON mcp_tools(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_tools_downloads ON mcp_tools(downloads DESC);
CREATE INDEX idx_tools_stars ON mcp_tools(stars DESC);
CREATE INDEX idx_tools_created ON mcp_tools(created_at DESC);

-- Full-text search index
CREATE INDEX idx_tools_search ON mcp_tools USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' '))
);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organizations are viewable by everyone" ON organizations FOR SELECT USING (true);
CREATE POLICY "Users can create organizations" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Organization owners can update their organizations" ON organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Organization owners can delete their organizations" ON organizations FOR DELETE USING (auth.uid() = owner_id);

-- MCP Tools policies
CREATE POLICY "Published tools are viewable by everyone" ON mcp_tools FOR SELECT USING (is_published = true OR auth.uid() = author_id);
CREATE POLICY "Users can create tools" ON mcp_tools FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Tool authors can update their tools" ON mcp_tools FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Tool authors can delete their tools" ON mcp_tools FOR DELETE USING (auth.uid() = author_id);

-- Tool configurations policies
CREATE POLICY "Tool configurations are viewable with their tools" ON tool_configurations FOR SELECT USING (
  EXISTS (SELECT 1 FROM mcp_tools WHERE id = tool_id AND (is_published = true OR auth.uid() = author_id))
);
CREATE POLICY "Tool authors can manage configurations" ON tool_configurations FOR ALL USING (
  EXISTS (SELECT 1 FROM mcp_tools WHERE id = tool_id AND auth.uid() = author_id)
);

-- Tool installations policies
CREATE POLICY "Users can view their own installations" ON tool_installations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own installations" ON tool_installations FOR ALL USING (auth.uid() = user_id);

-- Tool reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON tool_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON tool_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON tool_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON tool_reviews FOR DELETE USING (auth.uid() = user_id);

-- Tool stars policies
CREATE POLICY "Stars are viewable by everyone" ON tool_stars FOR SELECT USING (true);
CREATE POLICY "Authenticated users can star tools" ON tool_stars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unstar tools" ON tool_stars FOR DELETE USING (auth.uid() = user_id);

-- Tool downloads policies
CREATE POLICY "Anyone can record downloads" ON tool_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Download stats are viewable by everyone" ON tool_downloads FOR SELECT USING (true);

-- User profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Functions for updating counters
CREATE OR REPLACE FUNCTION update_tool_stars_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mcp_tools SET stars = stars + 1 WHERE id = NEW.tool_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mcp_tools SET stars = stars - 1 WHERE id = OLD.tool_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tool_downloads_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mcp_tools SET downloads = downloads + 1 WHERE id = NEW.tool_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_tool_stars
  AFTER INSERT OR DELETE ON tool_stars
  FOR EACH ROW EXECUTE FUNCTION update_tool_stars_count();

CREATE TRIGGER trigger_update_tool_downloads
  AFTER INSERT ON tool_downloads
  FOR EACH ROW EXECUTE FUNCTION update_tool_downloads_count();

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mcp_tools_updated_at BEFORE UPDATE ON mcp_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_reviews_updated_at BEFORE UPDATE ON tool_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
