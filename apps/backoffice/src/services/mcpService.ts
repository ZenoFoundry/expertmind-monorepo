import { MCPConfig } from '@/types';

let mockMCPConfigs: MCPConfig[] = [
  {
    id: '1',
    name: 'Filesystem Browser',
    description: 'Permite navegar y leer archivos del sistema de archivos local de forma segura.',
    type: 'filesystem',
    configuration: {
      allowedPaths: ['/home/user/documents', '/home/user/projects'],
      permissions: ['read', 'list'],
      maxFileSize: '10MB',
      excludePatterns: ['*.log', '*.tmp', 'node_modules']
    },
    isPopular: true,
    createdAt: '2025-08-05T10:00:00Z',
    isActive: true
  },
  {
    id: '2',
    name: 'Web Search API',
    description: 'Integración con APIs de búsqueda web para obtener información actualizada de internet.',
    type: 'api',
    configuration: {
      provider: 'brave',
      apiKey: 'brave_*********************',
      maxResults: 10,
      safeSearch: 'moderate',
      region: 'es-AR'
    },
    isPopular: true,
    createdAt: '2025-08-06T14:30:00Z',
    isActive: true
  },
  {
    id: '3',
    name: 'Database Query',
    description: 'Ejecuta consultas SQL seguras en bases de datos configuradas.',
    type: 'database',
    configuration: {
      connectionString: 'postgresql://***:***@localhost:5432/expertmind',
      allowedOperations: ['SELECT', 'INSERT', 'UPDATE'],
      maxQueryTime: 30,
      resultLimit: 1000
    },
    isPopular: true,
    createdAt: '2025-08-08T09:15:00Z',
    isActive: true
  },
  {
    id: '4',
    name: 'Git Operations',
    description: 'Operaciones básicas con repositorios Git: status, log, diff.',
    type: 'tools',
    configuration: {
      allowedRepos: ['/home/user/projects/*'],
      allowedCommands: ['status', 'log', 'diff', 'branch'],
      maxLogEntries: 50
    },
    isPopular: true,
    createdAt: '2025-08-10T16:45:00Z',
    isActive: true
  },
  {
    id: '5',
    name: 'Code Executor',
    description: 'Ejecuta código en entornos sandbox seguros para diferentes lenguajes.',
    type: 'tools',
    configuration: {
      supportedLanguages: ['python', 'javascript', 'bash'],
      timeout: 30,
      memoryLimit: '256MB',
      networkAccess: false
    },
    isPopular: true,
    createdAt: '2025-08-12T11:20:00Z',
    isActive: true
  },
  {
    id: '6',
    name: 'Email Integration',
    description: 'Envío y gestión de emails a través de SMTP configurado.',
    type: 'api',
    configuration: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      username: 'noreply@expertmind.com',
      password: '*********************',
      fromAddress: 'ExpertMind System <noreply@expertmind.com>'
    },
    isPopular: false,
    createdAt: '2025-08-15T13:30:00Z',
    isActive: true
  },
  {
    id: '7',
    name: 'Calendar Integration',
    description: 'Integración con Google Calendar para gestionar eventos y recordatorios.',
    type: 'api',
    configuration: {
      provider: 'google',
      clientId: 'google_client_*********************',
      clientSecret: 'google_secret_*********************',
      scopes: ['calendar.readonly', 'calendar.events']
    },
    isPopular: false,
    createdAt: '2025-08-18T09:45:00Z',
    isActive: true
  },
  {
    id: '8',
    name: 'Slack Integration',
    description: 'Integración con Slack para enviar mensajes y notificaciones.',
    type: 'api',
    configuration: {
      botToken: 'xoxb-*********************',
      signingSecret: 'slack_signing_*********************',
      defaultChannel: '#general',
      allowedChannels: ['#general', '#dev', '#support']
    },
    isPopular: false,
    createdAt: '2025-08-20T15:10:00Z',
    isActive: false
  }
];

class MCPService {
  async getMCPConfigs(): Promise<MCPConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...mockMCPConfigs];
  }

  async getMCPConfigById(id: string): Promise<MCPConfig | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockMCPConfigs.find(mcp => mcp.id === id) || null;
  }

  async createMCPConfig(mcpData: Omit<MCPConfig, 'id' | 'createdAt'>): Promise<MCPConfig> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const newMCP: MCPConfig = {
      ...mcpData,
      id: (mockMCPConfigs.length + 1).toString(),
      createdAt: new Date().toISOString()
    };
    
    mockMCPConfigs.push(newMCP);
    return newMCP;
  }

  async updateMCPConfig(id: string, mcpData: Partial<MCPConfig>): Promise<MCPConfig> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mcpIndex = mockMCPConfigs.findIndex(mcp => mcp.id === id);
    if (mcpIndex === -1) {
      throw new Error('Configuración MCP no encontrada');
    }
    
    mockMCPConfigs[mcpIndex] = { ...mockMCPConfigs[mcpIndex], ...mcpData };
    return mockMCPConfigs[mcpIndex];
  }

  async deleteMCPConfig(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mcpIndex = mockMCPConfigs.findIndex(mcp => mcp.id === id);
    if (mcpIndex === -1) {
      throw new Error('Configuración MCP no encontrada');
    }
    
    mockMCPConfigs.splice(mcpIndex, 1);
  }

  async toggleMCPStatus(id: string): Promise<MCPConfig> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mcp = mockMCPConfigs.find(mcp => mcp.id === id);
    if (!mcp) {
      throw new Error('Configuración MCP no encontrada');
    }
    
    mcp.isActive = !mcp.isActive;
    return mcp;
  }

  async getPopularMCPs(): Promise<MCPConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMCPConfigs.filter(mcp => mcp.isPopular && mcp.isActive);
  }

  async getMCPsByType(type: MCPConfig['type']): Promise<MCPConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMCPConfigs.filter(mcp => mcp.type === type);
  }
}

export const mcpService = new MCPService();
