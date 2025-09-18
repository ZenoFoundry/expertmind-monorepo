import { Profile } from '@/types';

let mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Chat Assistant',
    systemPrompt: 'Eres un asistente conversacional especializado en ayudar a los usuarios con consultas generales, proporcionando respuestas precisas y útiles.',
    contextData: 'Usuario preferencias: español, respuestas concisas, tono profesional pero amigable.',
    apiKey: 'sk-*********************123',
    llmProvider: 'openai',
    tokensAllowed: 100000,
    mcpConfigs: ['1', '2', '3'],
    createdAt: '2025-08-10T10:00:00Z',
    isActive: true
  },
  {
    id: '2',
    name: 'Code Helper',
    systemPrompt: 'Eres un asistente especializado en programación. Ayudas con código, debugging, mejores prácticas y explicaciones técnicas claras.',
    contextData: 'Lenguajes: JavaScript, TypeScript, Python, React. Estilo: Clean Code, comentarios explicativos.',
    apiKey: 'sk-*********************456',
    llmProvider: 'openai',
    tokensAllowed: 150000,
    mcpConfigs: ['1', '4', '5'],
    createdAt: '2025-08-12T14:30:00Z',
    isActive: true
  },
  {
    id: '3',
    name: 'Content Writer',
    systemPrompt: 'Especialista en creación de contenido. Generas textos persuasivos, artículos, posts para redes sociales y material promocional.',
    contextData: 'Tono: profesional, creativo. Audiencia: B2B y B2C. Formatos: blogs, social media, emails.',
    apiKey: 'sk-*********************789',
    llmProvider: 'anthropic',
    tokensAllowed: 80000,
    mcpConfigs: ['2', '6'],
    createdAt: '2025-08-15T09:15:00Z',
    isActive: true
  },
  {
    id: '4',
    name: 'Data Analyst',
    systemPrompt: 'Experto en análisis de datos. Interpretas datasets, generas insights y creas visualizaciones comprensibles.',
    contextData: 'Herramientas: Python, pandas, matplotlib, SQL. Enfoque: estadística descriptiva e inferencial.',
    apiKey: 'sk-*********************101',
    llmProvider: 'local',
    tokensAllowed: 120000,
    mcpConfigs: ['7', '8'],
    createdAt: '2025-08-18T16:45:00Z',
    isActive: true
  },
  {
    id: '5',
    name: 'Customer Support',
    systemPrompt: 'Asistente de atención al cliente. Resuelves dudas, problemas técnicos y brindas soporte empático y eficiente.',
    contextData: 'Productos: ExpertMind suite. Política: resolución en primer contacto, escalación automática.',
    apiKey: 'sk-*********************202',
    llmProvider: 'openai',
    tokensAllowed: 75000,
    mcpConfigs: ['1', '3'],
    createdAt: '2025-08-25T12:20:00Z',
    isActive: false
  }
];

class ProfileService {
  async getProfiles(): Promise<Profile[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...mockProfiles];
  }

  async getProfileById(id: string): Promise<Profile | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockProfiles.find(profile => profile.id === id) || null;
  }

  async createProfile(profileData: Omit<Profile, 'id' | 'createdAt'>): Promise<Profile> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const newProfile: Profile = {
      ...profileData,
      id: (mockProfiles.length + 1).toString(),
      createdAt: new Date().toISOString()
    };
    
    mockProfiles.push(newProfile);
    return newProfile;
  }

  async updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const profileIndex = mockProfiles.findIndex(profile => profile.id === id);
    if (profileIndex === -1) {
      throw new Error('Perfil no encontrado');
    }
    
    mockProfiles[profileIndex] = { ...mockProfiles[profileIndex], ...profileData };
    return mockProfiles[profileIndex];
  }

  async deleteProfile(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const profileIndex = mockProfiles.findIndex(profile => profile.id === id);
    if (profileIndex === -1) {
      throw new Error('Perfil no encontrado');
    }
    
    mockProfiles.splice(profileIndex, 1);
  }

  async toggleProfileStatus(id: string): Promise<Profile> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const profile = mockProfiles.find(profile => profile.id === id);
    if (!profile) {
      throw new Error('Perfil no encontrado');
    }
    
    profile.isActive = !profile.isActive;
    return profile;
  }

  async getActiveProfiles(): Promise<Profile[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProfiles.filter(profile => profile.isActive);
  }
}

export const profileService = new ProfileService();
