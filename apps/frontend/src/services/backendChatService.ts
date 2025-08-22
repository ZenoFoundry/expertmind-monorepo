import { HttpInterceptor } from '../utils/httpInterceptor';
import { authService } from './authService';
import {
  BackendConversation,
  BackendMessage,
  CreateConversationRequest,
  SendMessageRequest,
  PaginatedResponse,
  AIProvider
} from '../types/chat-backend';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class BackendChatService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  // ===============================
  // VERIFICACIONES
  // ===============================

  isAvailable(): boolean {
    return authService.isAuthenticated();
  }

  async healthCheck(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await HttpInterceptor.get(`${this.baseUrl}/chat/providers`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Verificar si hay proveedores disponibles y si están healthy
        const hasHealthyProviders = data.some((provider: any) => provider.isHealthy);
        
        if (hasHealthyProviders) {
          return { success: true, message: 'Backend chat service is available' };
        } else {
          return { 
            success: false, 
            message: '⚠️ Backend disponible pero ningún proveedor de IA está activo (Ollama no está ejecutándose)' 
          };
        }
      } else {
        return { success: false, message: 'Backend chat service is not responding' };
      }
    } catch (error) {
      console.error('BackendChatService.healthCheck error:', error);
      return {
        success: false,
        message: 'Cannot connect to backend chat service'
      };
    }
  }

  // ===============================
  // CONVERSACIONES
  // ===============================

  async getConversations(params: PaginationParams = {}): Promise<PaginatedResponse<BackendConversation>> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${this.baseUrl}/chat/conversations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await HttpInterceptor.get(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas de string a Date
      data.data = data.data.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        lastActivity: new Date(conv.lastActivity),
        lastMessage: conv.lastMessage ? {
          ...conv.lastMessage,
          createdAt: new Date(conv.lastMessage.createdAt)
        } : undefined
      }));

      return data;
    } catch (error) {
      console.error('BackendChatService.getConversations error:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<BackendConversation> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.get(`${this.baseUrl}/chat/conversations/${conversationId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        lastActivity: new Date(data.lastActivity),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: new Date(data.lastMessage.createdAt)
        } : undefined
      };
    } catch (error) {
      console.error('BackendChatService.getConversation error:', error);
      throw error;
    }
  }

  async createConversation(request: CreateConversationRequest): Promise<BackendConversation> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.post(
        `${this.baseUrl}/chat/conversations`,
        request
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        lastActivity: new Date(data.lastActivity)
      };
    } catch (error) {
      console.error('BackendChatService.createConversation error:', error);
      throw error;
    }
  }

  async updateConversation(conversationId: string, updates: Partial<CreateConversationRequest & { isActive: boolean }>): Promise<BackendConversation> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.put(
        `${this.baseUrl}/chat/conversations/${conversationId}`,
        updates
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        lastActivity: new Date(data.lastActivity)
      };
    } catch (error) {
      console.error('BackendChatService.updateConversation error:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.delete(`${this.baseUrl}/chat/conversations/${conversationId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('BackendChatService.deleteConversation error:', error);
      throw error;
    }
  }

  // ===============================
  // MENSAJES
  // ===============================

  async getMessages(conversationId: string, params: PaginationParams = {}): Promise<PaginatedResponse<BackendMessage>> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${this.baseUrl}/chat/conversations/${conversationId}/messages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await HttpInterceptor.get(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas
      data.data = data.data.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt)
      }));

      return data;
    } catch (error) {
      console.error('BackendChatService.getMessages error:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, request: SendMessageRequest): Promise<BackendMessage> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.post(
        `${this.baseUrl}/chat/conversations/${conversationId}/messages`,
        request
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
    } catch (error) {
      console.error('BackendChatService.sendMessage error:', error);
      throw error;
    }
  }

  // ===============================
  // UTILIDADES
  // ===============================

  async getConversationStats(conversationId: string): Promise<{
    messageCount: number;
    tokensUsed: number;
    averageResponseTime: number;
    lastActivity: Date;
  }> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.get(`${this.baseUrl}/chat/conversations/${conversationId}/stats`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        ...data,
        lastActivity: new Date(data.lastActivity)
      };
    } catch (error) {
      console.error('BackendChatService.getConversationStats error:', error);
      throw error;
    }
  }

  async searchMessages(conversationId: string, query: string): Promise<BackendMessage[]> {
    if (!this.isAvailable()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await HttpInterceptor.get(
        `${this.baseUrl}/chat/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convertir fechas
      return data.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt)
      }));
    } catch (error) {
      console.error('BackendChatService.searchMessages error:', error);
      throw error;
    }
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    try {
      const response = await HttpInterceptor.get(`${this.baseUrl}/chat/providers`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BackendChatService.getAvailableProviders error:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const backendChatService = new BackendChatService();
