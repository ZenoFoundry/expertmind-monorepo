import { useState, useEffect, useCallback, useRef } from 'react';
import { unifiedChatService } from '../../services/unifiedChatService';
import { authService } from '../../services/authService';
import {
  UnifiedConversation,
  UnifiedMessage,
  CreateConversationAction,
  SendMessageAction,
  ChatState,
  ChatMode
} from '../../types/chat-backend';
import { ApiConfig } from '../../types';

export interface UseChatStateReturn {
  // Estado
  state: ChatState;
  
  // Información de estado
  mode: ChatMode;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Conversaciones
  conversations: UnifiedConversation[];
  activeConversation: UnifiedConversation | null;
  messages: UnifiedMessage[];
  
  // Acciones de conversaciones
  createConversation: (action: CreateConversationAction) => Promise<UnifiedConversation | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  
  // Acciones de mensajes
  sendMessage: (content: string, options?: Partial<SendMessageAction>) => Promise<UnifiedMessage | null>;
  refreshMessages: () => Promise<void>;
  searchMessages: (query: string) => Promise<UnifiedMessage[]>;
  
  // Gestión de modo
  switchToOnlineMode: () => Promise<boolean>;
  switchToOfflineMode: () => void;
  getStatusInfo: () => ReturnType<typeof unifiedChatService.getStatusInfo>;
  
  // Utilidades
  clearError: () => void;
  getAvailableProviders: () => Promise<any[]>;
}

export function useChatState(apiConfig?: ApiConfig): UseChatStateReturn {
  // ===============================
  // ESTADO LOCAL
  // ===============================
  
  const [state, setState] = useState<ChatState>({
    mode: 'offline',
    isLoading: false,
    error: null,
    conversations: [],
    activeConversationId: null,
    messages: [],
    apiConfig: apiConfig || {
      url: 'http://localhost:3001/ollama/chat',
      apiKey: '',
      headers: {},
      timeout: 30000,
      model: 'tinyllama',
      temperature: 0.7,
      maxTokens: 1000
    },
    sync: {
      pendingSync: false,
      conflictCount: 0
    }
  });

  // Referencias para evitar re-renders innecesarios
  const mountedRef = useRef(true);
  const activeConversationRef = useRef<string | null>(null);

  // ===============================
  // EFECTOS DE INICIALIZACIÓN
  // ===============================

  // Efecto principal de inicialización
  useEffect(() => {
    mountedRef.current = true;
    initializeChatState();

    // Listener para cambios de autenticación
    const handleAuthChange = () => {
      if (mountedRef.current) {
        handleModeChange();
      }
    };

    // Listener para cambios de conexión
    const handleOnlineChange = () => {
      if (mountedRef.current) {
        handleModeChange();
      }
    };

    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    // Cleanup
    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, []);

  // Efecto para monitorear cambios en la conversación activa
  useEffect(() => {
    if (state.activeConversationId && state.activeConversationId !== activeConversationRef.current) {
      activeConversationRef.current = state.activeConversationId;
      loadMessagesForActiveConversation();
    }
  }, [state.activeConversationId]);

  // ===============================
  // FUNCIONES AUXILIARES
  // ===============================

  const safeSetState = useCallback((updater: (prevState: ChatState) => ChatState) => {
    if (mountedRef.current) {
      setState(updater);
    }
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    safeSetState(prev => ({ ...prev, isLoading }));
  }, [safeSetState]);

  const setError = useCallback((error: string | null) => {
    safeSetState(prev => ({ ...prev, error }));
  }, [safeSetState]);

  const updateMode = useCallback(() => {
    const newMode = unifiedChatService.getCurrentMode();
    safeSetState(prev => ({ ...prev, mode: newMode }));
  }, [safeSetState]);

  // ===============================
  // INICIALIZACIÓN
  // ===============================

  const initializeChatState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Actualizar modo
      updateMode();

      // Cargar conversaciones
      await loadConversations();

      console.log('✅ Chat state initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing chat state:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  }, [updateMode, setLoading, setError]);

  const handleModeChange = useCallback(async () => {
    try {
      updateMode();
      
      // Recargar conversaciones cuando cambie el modo
      await loadConversations();
      
      // Si había una conversación activa, intentar mantenerla
      if (activeConversationRef.current) {
        await loadMessagesForActiveConversation();
      }
    } catch (error) {
      console.error('Error handling mode change:', error);
      setError('Failed to switch modes');
    }
  }, [updateMode, setError]);

  // ===============================
  // GESTIÓN DE CONVERSACIONES
  // ===============================

  const loadConversations = useCallback(async () => {
    try {
      const conversations = await unifiedChatService.getConversations();
      
      safeSetState(prev => ({
        ...prev,
        conversations,
        // Si no hay conversación activa pero hay conversaciones, seleccionar la primera
        activeConversationId: prev.activeConversationId || (conversations.length > 0 ? conversations[0].id : null)
      }));

      console.log(`📚 Loaded ${conversations.length} conversations in ${unifiedChatService.getCurrentMode()} mode`);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    }
  }, [safeSetState, setError]);

  const createConversation = useCallback(async (action: CreateConversationAction): Promise<UnifiedConversation | null> => {
    try {
      setLoading(true);
      setError(null);

      const newConversation = await unifiedChatService.createConversation(action);
      
      safeSetState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        activeConversationId: newConversation.id
      }));

      console.log(`✅ Created conversation: ${newConversation.title}`);
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, safeSetState]);

  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      // Verificar que la conversación existe
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      safeSetState(prev => ({
        ...prev,
        activeConversationId: conversationId,
        messages: [] // Limpiar mensajes mientras cargan los nuevos
      }));

      console.log(`📖 Selected conversation: ${conversation.title}`);
    } catch (error) {
      console.error('Error selecting conversation:', error);
      setError('Failed to select conversation');
    }
  }, [state.conversations, safeSetState, setError]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);

      await unifiedChatService.deleteConversation(conversationId);
      
      safeSetState(prev => {
        const updatedConversations = prev.conversations.filter(c => c.id !== conversationId);
        const newActiveId = prev.activeConversationId === conversationId 
          ? (updatedConversations.length > 0 ? updatedConversations[0].id : null)
          : prev.activeConversationId;

        return {
          ...prev,
          conversations: updatedConversations,
          activeConversationId: newActiveId,
          messages: prev.activeConversationId === conversationId ? [] : prev.messages
        };
      });

      console.log(`🗑️ Deleted conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete conversation');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, safeSetState]);

  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // ===============================
  // GESTIÓN DE MENSAJES
  // ===============================

  const loadMessagesForActiveConversation = useCallback(async () => {
    if (!state.activeConversationId) {
      safeSetState(prev => ({ ...prev, messages: [] }));
      return;
    }

    try {
      const messages = await unifiedChatService.getMessages(state.activeConversationId);
      
      safeSetState(prev => ({ ...prev, messages }));
      console.log(`💬 Loaded ${messages.length} messages for conversation ${state.activeConversationId}`);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  }, [state.activeConversationId, safeSetState, setError]);

  const sendMessage = useCallback(async (content: string, options: Partial<SendMessageAction> = {}): Promise<UnifiedMessage | null> => {
    if (!state.activeConversationId) {
      setError('No active conversation');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const action: SendMessageAction = {
        content,
        conversationId: state.activeConversationId,
        ...options
      };

      // Agregar mensaje optimista del usuario
      const optimisticUserMessage: UnifiedMessage = {
        id: `temp_${Date.now()}`,
        conversationId: state.activeConversationId,
        role: 'user',
        content,
        timestamp: new Date(),
        source: state.mode === 'online' ? 'backend' : 'localStorage',
        status: 'pending'
      };

      safeSetState(prev => ({
        ...prev,
        messages: [...prev.messages, optimisticUserMessage]
      }));

      // Enviar mensaje real
      const sentMessage = await unifiedChatService.sendMessage(action);
      
      // Recargar mensajes para obtener la respuesta del asistente
      await loadMessagesForActiveConversation();

      console.log(`📤 Sent message in conversation ${state.activeConversationId}`);
      return sentMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Determinar el mensaje de error más apropiado
      let errorMessage = 'Failed to send message';
      if (error instanceof Error) {
        if (error.message.includes('Ollama no está disponible')) {
          errorMessage = error.message;
        } else if (error.message.includes('Connection refused') || error.message.includes('ECONNREFUSED')) {
          errorMessage = '❌ No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (error.message.includes('11434')) {
          errorMessage = '❌ Ollama no está disponible en el puerto 11434. Asegúrate de tenerlo ejecutándose.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Quitar mensaje optimista en caso de error
      safeSetState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => !m.id.startsWith('temp_'))
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.activeConversationId, state.mode, setLoading, setError, safeSetState, loadMessagesForActiveConversation]);

  const refreshMessages = useCallback(async () => {
    await loadMessagesForActiveConversation();
  }, [loadMessagesForActiveConversation]);

  const searchMessages = useCallback(async (query: string): Promise<UnifiedMessage[]> => {
    if (!state.activeConversationId || !query.trim()) {
      return [];
    }

    try {
      return await unifiedChatService.searchMessages(state.activeConversationId, query);
    } catch (error) {
      console.error('Error searching messages:', error);
      setError('Failed to search messages');
      return [];
    }
  }, [state.activeConversationId, setError]);

  // ===============================
  // GESTIÓN DE MODO
  // ===============================

  const switchToOnlineMode = useCallback(async (): Promise<boolean> => {
    try {
      const success = await unifiedChatService.switchToOnlineMode();
      if (success) {
        updateMode();
        await loadConversations();
      }
      return success;
    } catch (error) {
      console.error('Error switching to online mode:', error);
      setError('Failed to switch to online mode');
      return false;
    }
  }, [updateMode, loadConversations, setError]);

  const switchToOfflineMode = useCallback(() => {
    unifiedChatService.switchToOfflineMode();
    updateMode();
    loadConversations();
  }, [updateMode, loadConversations]);

  // ===============================
  // UTILIDADES
  // ===============================

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const getAvailableProviders = useCallback(async () => {
    try {
      return await unifiedChatService.getAvailableProviders();
    } catch (error) {
      console.error('Error getting providers:', error);
      return [];
    }
  }, []);

  const getStatusInfo = useCallback(() => {
    return unifiedChatService.getStatusInfo();
  }, []);

  // ===============================
  // VALORES DERIVADOS
  // ===============================

  const activeConversation = state.conversations.find(c => c.id === state.activeConversationId) || null;
  const isAuthenticated = authService.isAuthenticated();

  // ===============================
  // RETURN
  // ===============================

  return {
    // Estado
    state,
    
    // Información de estado
    mode: state.mode,
    isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Conversaciones
    conversations: state.conversations,
    activeConversation,
    messages: state.messages,
    
    // Acciones de conversaciones
    createConversation,
    selectConversation,
    deleteConversation,
    refreshConversations,
    
    // Acciones de mensajes
    sendMessage,
    refreshMessages,
    searchMessages,
    
    // Gestión de modo
    switchToOnlineMode,
    switchToOfflineMode,
    getStatusInfo,
    
    // Utilidades
    clearError,
    getAvailableProviders
  };
}
