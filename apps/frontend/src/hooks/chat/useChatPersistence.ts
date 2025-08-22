import { useState, useEffect, useCallback } from 'react';
import { UnifiedConversation, UnifiedMessage, ChatMode } from '../../types/chat-backend';

export interface UseChatPersistenceReturn {
  isDirty: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  saveState: (conversations: UnifiedConversation[], messages: UnifiedMessage[]) => Promise<void>;
  loadState: () => Promise<{ conversations: UnifiedConversation[]; messages: UnifiedMessage[] } | null>;
  clearState: () => Promise<void>;
  setAutoSave: (enabled: boolean) => void;
}

/**
 * Hook para manejar la persistencia y sincronización del estado del chat
 */
export function useChatPersistence(mode: ChatMode): UseChatPersistenceReturn {
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save cada 30 segundos si hay cambios
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    const autoSaveInterval = setInterval(() => {
      // El auto-save se maneja desde el hook principal
      console.log('🔄 Auto-save triggered');
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, isDirty]);

  const saveState = useCallback(async (
    conversations: UnifiedConversation[], 
    messages: UnifiedMessage[]
  ): Promise<void> => {
    try {
      const stateToSave = {
        conversations,
        messages,
        mode,
        timestamp: new Date().toISOString()
      };

      // Guardar en localStorage como backup
      localStorage.setItem('em-chat-state-backup', JSON.stringify(stateToSave));
      
      setLastSaved(new Date());
      setIsDirty(false);
      
      console.log('💾 Chat state saved to localStorage backup');
    } catch (error) {
      console.error('Error saving chat state:', error);
    }
  }, [mode]);

  const loadState = useCallback(async (): Promise<{ 
    conversations: UnifiedConversation[]; 
    messages: UnifiedMessage[] 
  } | null> => {
    try {
      const savedState = localStorage.getItem('em-chat-state-backup');
      if (!savedState) return null;

      const parsed = JSON.parse(savedState);
      
      // Convertir fechas de string a Date
      const conversations = parsed.conversations?.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        lastActivity: new Date(conv.lastActivity),
        lastMessage: conv.lastMessage ? {
          ...conv.lastMessage,
          createdAt: new Date(conv.lastMessage.createdAt)
        } : undefined
      })) || [];

      const messages = parsed.messages?.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) || [];

      console.log('📂 Loaded chat state from localStorage backup');
      
      return { conversations, messages };
    } catch (error) {
      console.error('Error loading chat state:', error);
      return null;
    }
  }, []);

  const clearState = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem('em-chat-state-backup');
      setLastSaved(null);
      setIsDirty(false);
      console.log('🗑️ Cleared chat state backup');
    } catch (error) {
      console.error('Error clearing chat state:', error);
    }
  }, []);

  const setAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    console.log(`🔄 Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  // Marcar como dirty cuando hay cambios
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  return {
    isDirty,
    lastSaved,
    autoSaveEnabled,
    saveState,
    loadState,
    clearState,
    setAutoSave
  };
}
