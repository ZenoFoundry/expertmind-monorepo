// CSS Modules types
/// <reference path="./css-modules.d.ts" />

// Tipos para la configuración de la API
export interface ApiConfig {
  url: string;
  apiKey: string;
  headers: Record<string, string>;
  timeout: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Tipos para mensajes del chat
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sessionId: string;
  attachments?: FileAttachment[];
}

// Tipos específicos para Ollama
export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

// Tipos para archivos adjuntos
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

// Tipos para sesiones de chat
export interface ChatSession {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

// Tipos para la respuesta de la API
export interface ApiResponse {
  content: string;
  error?: string;
}

// Tipos para el estado de la aplicación
export interface AppState {
  currentSession: ChatSession | null;
  messages: Message[];
  sessions: ChatSession[];
  apiConfig: ApiConfig;
  isLoading: boolean;
  error: string | null;
}
