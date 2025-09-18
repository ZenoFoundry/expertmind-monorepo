export interface User {
  id: string;
  email: string;
  name: string;
  profileId: string;
  profileName: string;
  lastLogin?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Profile {
  id: string;
  name: string;
  systemPrompt: string;
  contextData: string;
  apiKey: string;
  llmProvider: 'openai' | 'anthropic' | 'local';
  tokensAllowed: number;
  mcpConfigs: string[];
  createdAt: string;
  isActive: boolean;
}

export interface MCPConfig {
  id: string;
  name: string;
  description: string;
  type: 'filesystem' | 'database' | 'api' | 'tools';
  configuration: Record<string, any>;
  isPopular: boolean;
  createdAt: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalProfiles: number;
  totalMCPs: number;
  mostConnectedUser: {
    name: string;
    connections: number;
  };
  topTokenUser: {
    name: string;
    tokens: number;
  };
  recentActivity: {
    users: number;
    profiles: number;
    mcps: number;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'operator';
}
