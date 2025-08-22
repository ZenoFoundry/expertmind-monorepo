import { useState, useCallback } from 'react';
import { UnifiedMessage } from '../../types/chat-backend';

export interface UseOptimisticMessagesReturn {
  optimisticMessages: UnifiedMessage[];
  addOptimisticMessage: (message: Omit<UnifiedMessage, 'id' | 'timestamp'>) => string;
  removeOptimisticMessage: (tempId: string) => void;
  replaceOptimisticMessage: (tempId: string, realMessage: UnifiedMessage) => void;
  clearOptimisticMessages: () => void;
}

/**
 * Hook para gestionar mensajes optimistas mientras se envían al servidor
 */
export function useOptimisticMessages(): UseOptimisticMessagesReturn {
  const [optimisticMessages, setOptimisticMessages] = useState<UnifiedMessage[]>([]);

  const addOptimisticMessage = useCallback((message: Omit<UnifiedMessage, 'id' | 'timestamp'>): string => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: UnifiedMessage = {
      ...message,
      id: tempId,
      timestamp: new Date(),
      status: 'pending'
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    return tempId;
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
  }, []);

  const replaceOptimisticMessage = useCallback((tempId: string, realMessage: UnifiedMessage) => {
    setOptimisticMessages(prev => 
      prev.map(msg => msg.id === tempId ? realMessage : msg)
    );
  }, []);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  return {
    optimisticMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    replaceOptimisticMessage,
    clearOptimisticMessages
  };
}
