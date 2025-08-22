import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { ChatMode } from '../../types/chat-backend';

export interface UseChatModeReturn {
  mode: ChatMode;
  isAuthenticated: boolean;
  isOnline: boolean;
  canUseBackend: boolean;
  switchToOnline: () => void;
  switchToOffline: () => void;
}

/**
 * Hook para detectar y gestionar el modo del chat
 */
export function useChatMode(): UseChatModeReturn {
  const [mode, setMode] = useState<ChatMode>('offline');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detectar cambios de autenticación
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      // Actualizar modo basado en autenticación y conexión
      if (authenticated && isOnline) {
        setMode('online');
      } else {
        setMode('offline');
      }
    };

    // Check inicial
    checkAuth();

    // Listener para cambios de conexión
    const handleOnlineChange = () => {
      setIsOnline(navigator.onLine);
      checkAuth();
    };

    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    // Polling ligero para detectar cambios de auth (opcional)
    const authCheckInterval = setInterval(checkAuth, 5000);

    return () => {
      window.removeEventListener('online', handleOnlineChange);
      clearInterval(authCheckInterval);
    };
  }, [isOnline]);

  const canUseBackend = isAuthenticated && isOnline;

  const switchToOnline = () => {
    if (canUseBackend) {
      setMode('online');
    }
  };

  const switchToOffline = () => {
    setMode('offline');
  };

  return {
    mode,
    isAuthenticated,
    isOnline,
    canUseBackend,
    switchToOnline,
    switchToOffline
  };
}
