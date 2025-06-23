
import { MCPTool } from '@/types/database';

export interface ToolboxProfile {
  id: string;
  name: string;
  tools: MCPTool[];
  color: string;
  isActive: boolean;
}

const DEFAULT_PROFILES: ToolboxProfile[] = [
  {
    id: 'personal',
    name: 'Personal',
    tools: [],
    color: 'bg-blue-600',
    isActive: true
  },
  {
    id: 'work',
    name: 'Work',
    tools: [],
    color: 'bg-green-600',
    isActive: false
  },
  {
    id: 'project',
    name: 'Project-specific',
    tools: [],
    color: 'bg-purple-600',
    isActive: false
  }
];

export const getProfiles = (): ToolboxProfile[] => {
  const saved = localStorage.getItem('toolbox_profiles');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse saved profiles:', error);
    }
  }
  return DEFAULT_PROFILES;
};

export const saveProfiles = (profiles: ToolboxProfile[]): void => {
  localStorage.setItem('toolbox_profiles', JSON.stringify(profiles));
};

export const getActiveProfile = (): ToolboxProfile => {
  const profiles = getProfiles();
  return profiles.find(p => p.isActive) || profiles[0];
};

export const addToolToProfile = (tool: MCPTool, profileId: string): void => {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (profile && !profile.tools.find(t => t.id === tool.id)) {
    profile.tools.push(tool);
    saveProfiles(profiles);
  }
};

export const removeToolFromProfile = (toolId: string, profileId: string): void => {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (profile) {
    profile.tools = profile.tools.filter(t => t.id !== toolId);
    saveProfiles(profiles);
  }
};

export const setActiveProfile = (profileId: string): void => {
  const profiles = getProfiles();
  profiles.forEach(p => {
    p.isActive = p.id === profileId;
  });
  saveProfiles(profiles);
};
