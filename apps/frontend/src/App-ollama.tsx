import React, { useState, useEffect } from 'react';
import { ChatSession, Message, ApiConfig, AppState } from './types';
import { dbManager } from './utils/database';
import { OllamaApiManager, defaultOllamaConfig } from './utils/ollama-api';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ConfigPanel from './components/ConfigPanel';

// Detectar si estamos en macOS
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentSession: null,
    messages: [],
    sessions: [],
    apiConfig: defaultOllamaConfig, // 🔥 Usar configuración de Ollama por defecto
    isLoading: false,
    error: null
  });

  const [ollamaApiManager, setOllamaApiManager] = useState<OllamaApiManager>(
    new OllamaApiManager(defaultOllamaConfig) // 🔥 Usar OllamaApiManager
  );

  const [showConfig, setShowConfig] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>(['tinyllama']);

  // Inicializar la aplicación
  useEffect(() => {
    initializeApp();
  }, []);

  // Cargar modelos disponibles cuando cambie la configuración
  useEffect(() => {
    loadAvailableModels();
  }, [appState.apiConfig.url]);

  // Inicializar base de datos y cargar configuración
  const initializeApp = async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      // Inicializar base de datos
      await dbManager.initialize();
      
      // Cargar sesiones existentes
      const sessions = await dbManager.getSessions();
      
      // Cargar configuración guardada (con fallback a Ollama)
      const savedConfig = loadApiConfig();
      const config = { ...defaultOllamaConfig, ...savedConfig };
      
      const newOllamaApiManager = new OllamaApiManager(config);
      setOllamaApiManager(newOllamaApiManager);
      
      setAppState(prev => ({
        ...prev,
        sessions,
        apiConfig: config,
        isLoading: false
      }));
      
      // Si hay sesiones, cargar la más reciente
      if (sessions.length > 0) {
        await selectSession(sessions[0]);
      }

      // Cargar modelos disponibles
      await loadAvailableModels();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      setAppState(prev => ({
        ...prev,
        error: 'Failed to initialize application',
        isLoading: false
      }));
    }
  };

  // Cargar modelos disponibles de Ollama
  const loadAvailableModels = async () => {
    try {
      const models = await ollamaApiManager.getAvailableModels();
      if (models.length > 0) {
        setAvailableModels(models);
        console.log('📋 Modelos disponibles:', models);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar los modelos de Ollama:', error);
    }
  };

  // Cargar configuración de API desde localStorage
  const loadApiConfig = (): Partial<ApiConfig> => {
    try {
      const saved = localStorage.getItem('em-chatbox-ollama-config'); // 🔥 Cambiar clave específica
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  // Guardar configuración de API
  const saveApiConfig = (config: ApiConfig) => {
    try {
      localStorage.setItem('em-chatbox-ollama-config', JSON.stringify(config)); // 🔥 Clave específica
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  // Seleccionar sesión
  const selectSession = async (session: ChatSession) => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      const messages = await dbManager.getMessages(session.id);
      
      // 🔥 Limpiar historial de conversación de Ollama para nueva sesión
      ollamaApiManager.clearHistory();
      
      // 🔥 Reconstruir historial de conversación para Ollama
      messages.forEach(msg => {
        ollamaApiManager.addToHistory({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      });
      
      setAppState(prev => ({
        ...prev,
        currentSession: session,
        messages,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error loading session:', error);
      setAppState(prev => ({
        ...prev,
        error: 'Failed to load session',
        isLoading: false
      }));
    }
  };

  // Crear nueva sesión
  const createNewSession = async (name?: string) => {
    try {
      const sessionName = name || `Chat ${new Date().toLocaleString()}`;
      const newSession = await dbManager.createSession(sessionName);
      
      const updatedSessions = [newSession, ...appState.sessions];
      
      // 🔥 Limpiar historial de Ollama para nueva sesión
      ollamaApiManager.clearHistory();
      
      setAppState(prev => ({
        ...prev,
        sessions: updatedSessions,
        currentSession: newSession,
        messages: []
      }));
      
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      setAppState(prev => ({
        ...prev,
        error: 'Failed to create new session'
      }));
    }
  };

  // Eliminar sesión
  const deleteSession = async (sessionId: string) => {
    try {
      await dbManager.deleteSession(sessionId);
      
      const updatedSessions = appState.sessions.filter(s => s.id !== sessionId);
      
      // Si la sesión eliminada era la actual, seleccionar otra o limpiar
      let newCurrentSession = appState.currentSession;
      let newMessages = appState.messages;
      
      if (appState.currentSession?.id === sessionId) {
        newCurrentSession = updatedSessions.length > 0 ? updatedSessions[0] : null;
        newMessages = [];
        
        // 🔥 Limpiar historial de Ollama
        ollamaApiManager.clearHistory();
        
        if (newCurrentSession) {
          const messages = await dbManager.getMessages(newCurrentSession.id);
          newMessages = messages;
          
          // 🔥 Reconstruir historial para Ollama
          messages.forEach(msg => {
            ollamaApiManager.addToHistory({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            });
          });
        }
      }
      
      setAppState(prev => ({
        ...prev,
        sessions: updatedSessions,
        currentSession: newCurrentSession,
        messages: newMessages
      }));
      
    } catch (error) {
      console.error('Error deleting session:', error);
      setAppState(prev => ({
        ...prev,
        error: 'Failed to delete session'
      }));
    }
  };

  // Enviar mensaje (🔥 MODIFICADO PARA OLLAMA)
  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!appState.currentSession) {
      // Crear nueva sesión si no hay una activa
      const session = await createNewSession();
      if (!session) return;
    }

    try {
      setAppState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('💬 Enviando mensaje a Ollama:', content);

      // Procesar archivos adjuntos si los hay (para futuras implementaciones)
      let fileAttachments = undefined;
      if (attachments && attachments.length > 0) {
        console.log('📎 Archivos adjuntos detectados (no implementado aún):', attachments.length);
      }

      // Guardar mensaje del usuario
      const userMessage = await dbManager.saveMessage({
        content,
        role: 'user',
        sessionId: appState.currentSession!.id,
        attachments: fileAttachments
      });

      // Actualizar estado con el mensaje del usuario
      setAppState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));

      // 🔥 Enviar a Ollama usando el nuevo ApiManager
      const response = await ollamaApiManager.sendMessage(content);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ Respuesta de Ollama recibida:', response.content);

      // Guardar respuesta del asistente
      const assistantMessage = await dbManager.saveMessage({
        content: response.content,
        role: 'assistant',
        sessionId: appState.currentSession!.id
      });

      // Actualizar estado con la respuesta
      setAppState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setAppState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send message',
        isLoading: false
      }));
    }
  };

  // Actualizar configuración de API (🔥 MODIFICADO PARA OLLAMA)
  const updateApiConfig = (newConfig: ApiConfig) => {
    ollamaApiManager.updateConfig(newConfig);
    setOllamaApiManager(new OllamaApiManager(newConfig));
    
    setAppState(prev => ({
      ...prev,
      apiConfig: newConfig
    }));
    
    saveApiConfig(newConfig);
    
    // Recargar modelos disponibles con nueva configuración
    loadAvailableModels();
  };

  // Limpiar error
  const clearError = () => {
    setAppState(prev => ({ ...prev, error: null }));
  };

  return (
    <div className={`container ${isMac ? 'mac-titlebar-padding' : ''}`}>
      {/* Área de arrastre para macOS */}
      {isMac && (
        <>
          <div className="drag-region" />
          <div className="traffic-lights-area" />
        </>
      )}
      
      {/* 🔥 Indicador de estado de Ollama */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: appState.error ? 'var(--error)' : 'var(--success)'
        }} />
        Ollama Backend
        {availableModels.length > 0 && (
          <span style={{ color: 'var(--text-muted)' }}>
            ({availableModels.length} models)
          </span>
        )}
      </div>
      
      {appState.error && (
        <div className="error mb-md">
          {appState.error}
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
        <Sidebar
          sessions={appState.sessions}
          currentSession={appState.currentSession}
          onSelectSession={selectSession}
          onCreateSession={createNewSession}
          onDeleteSession={deleteSession}
          onShowConfig={() => setShowConfig(true)}
        />
        
        <div className="main-content">
          <ChatArea
            messages={appState.messages}
            currentSession={appState.currentSession}
            isLoading={appState.isLoading}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
      
      {showConfig && (
        <ConfigPanel
          apiConfig={appState.apiConfig}
          onUpdateConfig={updateApiConfig}
          onClose={() => setShowConfig(false)}
          apiManager={ollamaApiManager} // 🔥 Pasar OllamaApiManager
          availableModels={availableModels} // 🔥 Pasar modelos disponibles
        />
      )}
    </div>
  );
};

export default App;
