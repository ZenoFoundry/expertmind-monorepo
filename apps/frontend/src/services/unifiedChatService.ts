import { authService } from './authService';
import { backendChatService } from './backendChatService';
import { dbManager } from '../utils/database';
import {
  UnifiedConversation,
  UnifiedMessage,
  CreateConversationAction,
  SendMessageAction,
  ChatMode,
  BackendConversation,
  BackendMessage
} from '../types/chat-backend';
import { ChatSession, Message } from '../types';

/**
 * Servicio que unifica el acceso a conversaciones y mensajes
 * entre localStorage (modo offline) y backend (modo online)
 */
export class UnifiedChatService {
  private currentMode: ChatMode = 'offline';

  constructor() {
    // Determinar el modo inicial
    this.updateMode();
  }

  // ===============================
  // GESTIÓN DE MODO
  // ===============================

  getCurrentMode(): ChatMode {
    return this.currentMode;
  }

  private updateMode(): void {
    const wasOnline = this.currentMode === 'online';
    this.currentMode = authService.isAuthenticated() && this.isBackendAvailable() ? 'online' : 'offline';
    
    if (wasOnline !== (this.currentMode === 'online')) {
      console.log(`🔄 Chat mode changed to: ${this.currentMode}`);
    }
  }

  private isBackendAvailable(): boolean {
    // Por ahora, simplemente verificamos si hay conexión
    // En el futuro podríamos hacer un health check
    return navigator.onLine;
  }

  async switchToOnlineMode(): Promise<boolean> {
    if (!authService.isAuthenticated()) {
      console.warn('Cannot switch to online mode: user not authenticated');
      return false;
    }

    try {
      const healthCheck = await backendChatService.healthCheck();
      if (healthCheck.success) {
        this.currentMode = 'online';
        console.log('✅ Switched to online mode');
        return true;
      } else {
        console.warn('Backend not available, staying in offline mode');
        return false;
      }
    } catch (error) {
      console.error('Error switching to online mode:', error);
      return false;
    }
  }

  switchToOfflineMode(): void {
    this.currentMode = 'offline';
    console.log('📱 Switched to offline mode');
  }

  // ===============================
  // ADAPTADORES DE TIPOS
  // ===============================

  private adaptBackendConversationToUnified(conv: BackendConversation): UnifiedConversation {
    return {
      id: conv.id,
      title: conv.title,
      model: conv.model,
      provider: conv.aiProvider,
      messageCount: conv.messageCount,
      lastActivity: conv.lastActivity,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      source: 'backend',
      isActive: conv.isActive,
      settings: conv.settings,
      lastMessage: conv.lastMessage
    };
  }

  private adaptLocalStorageConversationToUnified(session: ChatSession): UnifiedConversation {
    return {
      id: session.id,
      title: session.name,
      model: 'unknown', // localStorage no tiene esta info
      provider: 'agno', // Asumimos Agno por defecto
      messageCount: session.messageCount,
      lastActivity: session.updatedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      source: 'localStorage',
      isActive: true
    };
  }

  private adaptBackendMessageToUnified(msg: BackendMessage): UnifiedMessage {
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
      source: 'backend',
      status: msg.status,
      error: msg.error,
      metadata: msg.metadata,
      attachments: msg.attachments
    };
  }

  private adaptLocalStorageMessageToUnified(msg: Message): UnifiedMessage {
    return {
      id: msg.id,
      conversationId: msg.sessionId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      source: 'localStorage',
      status: 'sent', // localStorage asume que están enviados
      attachments: msg.attachments?.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        path: att.path
      }))
    };
  }

  // ===============================
  // OPERACIONES UNIFICADAS
  // ===============================

  async getConversations(): Promise<UnifiedConversation[]> {
    this.updateMode();

    if (this.currentMode === 'online') {
      try {
        const response = await backendChatService.getConversations({ page: 1, limit: 100 });
        return response.data.map(conv => this.adaptBackendConversationToUnified(conv));
      } catch (error) {
        console.error('Failed to get conversations from backend, falling back to localStorage:', error);
        this.switchToOfflineMode();
        // Continuar con localStorage como fallback
      }
    }

    // Modo offline o fallback
    const sessions = await dbManager.getSessions();
    return sessions.map(session => this.adaptLocalStorageConversationToUnified(session));
  }

  async getConversation(conversationId: string): Promise<UnifiedConversation | null> {
    this.updateMode();

    if (this.currentMode === 'online') {
      try {
        const conv = await backendChatService.getConversation(conversationId);
        return this.adaptBackendConversationToUnified(conv);
      } catch (error) {
        console.error('Failed to get conversation from backend:', error);
        // No hacer fallback aquí porque el ID podría no existir en localStorage
        return null;
      }
    }

    // Modo offline
    const sessions = await dbManager.getSessions();
    const session = sessions.find(s => s.id === conversationId);
    return session ? this.adaptLocalStorageConversationToUnified(session) : null;
  }

  async createConversation(action: CreateConversationAction): Promise<UnifiedConversation> {
    this.updateMode();

    if (this.currentMode === 'online') {
      try {
        const request = {
          title: action.title,
          aiProvider: (action.provider as any) || 'ollama',
          model: action.model,
          systemPrompt: action.systemPrompt,
          settings: action.settings
        };

        const conv = await backendChatService.createConversation(request);
        return this.adaptBackendConversationToUnified(conv);
      } catch (error) {
        console.error('Failed to create conversation in backend, falling back to localStorage:', error);
        this.switchToOfflineMode();
        // Continuar con localStorage como fallback
      }
    }

    // Modo offline o fallback
    const session = await dbManager.createSession(action.title);
    return this.adaptLocalStorageConversationToUnified(session);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.updateMode();

    // Primero intentar determinar la fuente de la conversación
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.source === 'backend' && this.currentMode === 'online') {
      try {
        await backendChatService.deleteConversation(conversationId);
        return;
      } catch (error) {
        console.error('Failed to delete conversation from backend:', error);
        throw error;
      }
    }

    // Modo offline o conversación de localStorage
    await dbManager.deleteSession(conversationId);
  }

  async getMessages(conversationId: string): Promise<UnifiedMessage[]> {
    this.updateMode();

    // Determinar la fuente de la conversación
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      return [];
    }

    if (conversation.source === 'backend' && this.currentMode === 'online') {
      try {
        const response = await backendChatService.getMessages(conversationId, { page: 1, limit: 100 });
        return response.data.map(msg => this.adaptBackendMessageToUnified(msg));
      } catch (error) {
        console.error('Failed to get messages from backend:', error);
        return [];
      }
    }

    // Modo offline o conversación de localStorage
    const messages = await dbManager.getMessages(conversationId);
    return messages.map(msg => this.adaptLocalStorageMessageToUnified(msg));
  }

  async sendMessage(action: SendMessageAction): Promise<UnifiedMessage> {
    this.updateMode();

    // Determinar la fuente de la conversación
    const conversation = await this.getConversation(action.conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.source === 'backend' && this.currentMode === 'online') {
      try {
        const request = {
          content: action.content,
          overrideSettings: action.overrideSettings,
          // TODO: Procesar attachments si es necesario
        };

        const message = await backendChatService.sendMessage(action.conversationId, request);
        return this.adaptBackendMessageToUnified(message);
      } catch (error) {
        console.error('Failed to send message to backend:', error);
        
        // Verificar si es un error de conexión con Ollama
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Ollama') || errorMessage.includes('11434') || errorMessage.includes('Connection refused')) {
          throw new Error('❌ La instancia de Ollama no está disponible. Por favor, asegúrate de que Ollama esté ejecutándose en http://localhost:11434');
        }
        
        throw error;
      }
    }

    // Modo offline o conversación de localStorage
    // Por ahora, lanzamos error porque necesitamos integrar con ApiManager
    // En una implementación completa, aquí usaríamos el ApiManager existente
    throw new Error('Sending messages in offline mode requires integration with ApiManager (not implemented yet)');
  }

  // ===============================
  // UTILIDADES
  // ===============================

  async getAvailableProviders() {
    if (this.currentMode === 'online') {
      try {
        return await backendChatService.getAvailableProviders();
      } catch (error) {
        console.error('Failed to get providers from backend:', error);
      }
    }

    // Fallback para modo offline
    return [
      {
        name: 'agno',
        models: ['gpt-4.1', 'o4-mini'], // Modelos por defecto de Agno
        isHealthy: true
      }
    ];
  }

  async searchMessages(conversationId: string, query: string): Promise<UnifiedMessage[]> {
    this.updateMode();

    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      return [];
    }

    if (conversation.source === 'backend' && this.currentMode === 'online') {
      try {
        const messages = await backendChatService.searchMessages(conversationId, query);
        return messages.map(msg => this.adaptBackendMessageToUnified(msg));
      } catch (error) {
        console.error('Failed to search messages in backend:', error);
      }
    }

    // Fallback: búsqueda local
    const messages = await this.getMessages(conversationId);
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // ===============================
  // INFORMACIÓN DE ESTADO
  // ===============================

  getStatusInfo() {
    return {
      mode: this.currentMode,
      isAuthenticated: authService.isAuthenticated(),
      isOnline: navigator.onLine,
      backendAvailable: this.isBackendAvailable()
    };
  }
}

// Instancia singleton del servicio unificado
export const unifiedChatService = new UnifiedChatService();
