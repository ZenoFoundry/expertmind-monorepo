import React, { useState, useEffect } from 'react';
import { useChatState } from './hooks/chat';
import { AuthProvider, AuthModal, SidebarUnified, ChatAreaUnified, ConfigPanel, ChatModeIndicator, UnifiedHeader, useAuth } from './components';
import { ApiConfig } from './types';
import { defaultApiConfig } from './utils/api';

// Detectar si estamos en macOS
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Componente interno que maneja la reactividad de autenticación
const AppUnifiedInternal: React.FC = () => {
  // Estado local para la UI
  const [showConfig, setShowConfig] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(defaultApiConfig);
  
  // Hook de autenticación (ya está dentro del AuthProvider)
  const { isAuthenticated, user } = useAuth();

  // Hook principal del chat unificado
  const {
    // Estado
    conversations,
    activeConversation,
    messages,
    mode,
    isLoading,
    error,
    
    // Acciones
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    
    // Utilidades
    clearError,
    switchToOnlineMode,
    switchToOfflineMode,
    getStatusInfo,
    refreshConversations
  } = useChatState(apiConfig);
  
  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    console.log('🔑 Auth state changed:', { isAuthenticated, user: user?.name });
    // Forzar actualización de conversaciones cuando cambie la autenticación
    refreshConversations();
  }, [isAuthenticated, user, refreshConversations]);

  // Cargar configuración guardada
  useEffect(() => {
    const loadApiConfig = () => {
      try {
        const saved = localStorage.getItem('em-chatbox-api-config');
        if (saved) {
          const savedConfig = JSON.parse(saved);
          setApiConfig({ ...defaultApiConfig, ...savedConfig });
        }
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    };

    loadApiConfig();
  }, []);

  // Guardar configuración
  const saveApiConfig = (config: ApiConfig) => {
    try {
      localStorage.setItem('em-chatbox-api-config', JSON.stringify(config));
      setApiConfig(config);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  // Crear nueva sesión
  const handleCreateSession = async (name?: string) => {
    const sessionName = name || `Chat ${new Date().toLocaleString()}`;
    
    try {
      await createConversation({
        title: sessionName,
        model: apiConfig.model || 'tinyllama',
        provider: 'ollama',
        settings: {
          temperature: apiConfig.temperature,
          maxTokens: apiConfig.maxTokens
        }
      });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Seleccionar sesión
  const handleSelectSession = async (sessionId: string) => {
    try {
      await selectConversation(sessionId);
    } catch (error) {
      console.error('Error selecting session:', error);
    }
  };

  // Eliminar sesión
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteConversation(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeConversation) {
      // Crear nueva conversación si no hay una activa
      await handleCreateSession();
    }

    try {
      await sendMessage(content, {
        attachments: attachments ? [] : undefined // TODO: procesar archivos
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mostrar indicador de modo si el usuario está autenticado o en desarrollo
  const showModeIndicator = isAuthenticated || process.env.NODE_ENV === 'development';

  return (
    <div className={`container ${isMac ? 'mac-titlebar-padding' : ''}`}>
        {/* Área de arrastre para macOS */}
        {isMac && (
          <>
            <div className="drag-region" />
            <div className="traffic-lights-area" />
          </>
        )}
        
        {/* Indicador de modo */}
        {showModeIndicator && (
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <ChatModeIndicator 
              compact={true}
              showSwitcher={isAuthenticated}
              onSwitchMode={(newMode) => {
                console.log(`Switched to ${newMode} mode`);
              }}
            />
          </div>
        )}
        
        {/* Error global */}
        {error && (
          <div className="error mb-md">
            {error}
            <button 
              className="btn btn-sm ml-md" 
              onClick={clearError}
              style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex flex-1">
          <SidebarUnified
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectSession}
            onCreateConversation={handleCreateSession}
            onDeleteConversation={handleDeleteSession}
            onShowConfig={() => setShowConfig(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
            isAuthenticated={isAuthenticated}
            mode={mode}
          />
          
          <div className="main-content">
            {/* Header unificado */}
            <UnifiedHeader
              conversation={activeConversation}
              isLoading={isLoading}
              mode={mode}
              isAuthenticated={isAuthenticated}
            />
            
            <ChatAreaUnified
              conversation={activeConversation}
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
        
        {showConfig && (
          <ConfigPanel
            apiConfig={apiConfig}
            onUpdateConfig={saveApiConfig}
            onClose={() => setShowConfig(false)}
            apiManager={null} // TODO: crear adaptador si es necesario
          />
        )}
        
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}

        {/* Debug info en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              position: 'fixed',
              bottom: '8px',
              right: '8px',
              padding: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              fontSize: '10px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}
          >
            <div>Mode: {mode}</div>
            <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>Conversations: {conversations.length}</div>
            <div>Messages: {messages.length}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    );
};

// Componente principal que wrappea con AuthProvider
const AppUnified: React.FC = () => {
  return (
    <AuthProvider>
      <AppUnifiedInternal />
    </AuthProvider>
  );
};

export default AppUnified;
