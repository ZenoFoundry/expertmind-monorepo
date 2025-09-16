// Nuevos tipos para la integración con el backend de chat

// ===============================
// TIPOS DEL BACKEND CHAT
// ===============================

export interface BackendConversation {
  id: string;
  title: string;
  aiProvider: 'agno' | 'anthropic' | 'openai';
  model: string;
  systemPrompt?: string;
  settings: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };
  messageCount: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  lastMessage?: {
    content: string;
    role: string;
    createdAt: Date;
  };
}

export interface BackendMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    tokensUsed?: number;
    processingTimeMs?: number;
    model?: string;
    temperature?: number;
    finishReason?: string;
    [key: string]: any;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  parentMessageId?: string;
  sequenceNumber: number;
}

export interface CreateConversationRequest {
  title: string;
  aiProvider: 'agno' | 'anthropic' | 'openai';
  model: string;
  systemPrompt?: string;
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };
}

export interface SendMessageRequest {
  content: string;
  parentMessageId?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    data: string; // base64
  }>;
  overrideSettings?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AIProvider {
  name: string;
  models: string[];
  isHealthy: boolean;
}

// ===============================
// TIPOS UNIFICADOS PARA LA UI
// ===============================

// Tipo unificado que puede venir de localStorage o backend
export interface UnifiedConversation {
  id: string;
  title: string;
  model: string;
  provider?: string;
  messageCount: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  source: 'localStorage' | 'backend'; // Para saber de dónde viene
  isActive?: boolean;
  settings?: Record<string, any>;
  lastMessage?: {
    content: string;
    role: string;
    createdAt: Date;
  };
}

// Tipo unificado para mensajes
export interface UnifiedMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  source: 'localStorage' | 'backend';
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  metadata?: Record<string, any>;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    path?: string;
  }>;
}

// ===============================
// TIPOS PARA EL ESTADO DE LA APP
// ===============================

export type ChatMode = 'offline' | 'online';

export interface ChatState {
  mode: ChatMode;
  isLoading: boolean;
  error: string | null;
  
  // Conversaciones unificadas
  conversations: UnifiedConversation[];
  activeConversationId: string | null;
  
  // Mensajes de la conversación activa
  messages: UnifiedMessage[];
  
  // Configuración
  apiConfig: ApiConfig;
  
  // Metadatos
  sync: {
    lastSync?: Date;
    pendingSync: boolean;
    conflictCount: number;
  };
}

// ===============================
// TIPOS PARA ACCIONES
// ===============================

export interface CreateConversationAction {
  title: string;
  model: string;
  provider?: string;
  systemPrompt?: string;
  settings?: Record<string, any>;
}

export interface SendMessageAction {
  content: string;
  conversationId: string;
  attachments?: File[];
  overrideSettings?: Record<string, any>;
}

// ===============================
// TIPOS PARA CONFIGURACIÓN
// ===============================

export interface ChatConfig {
  preferOnlineMode: boolean;
  autoSync: boolean;
  offlineFallback: boolean;
  maxOfflineConversations: number;
  maxOfflineMessages: number;
}
