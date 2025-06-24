import React, { useState, useEffect } from 'react';
import { ChatSession, Message, ApiConfig, AppState } from './types';
import { dbManager } from './utils/database';
import { ApiManager, defaultApiConfig } from './utils/api';
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
    apiConfig: defaultApiConfig,
    isLoading: false,
    error: null
  });

  const [apiManager, setApiManager] = useState<ApiManager>(
    new ApiManager(defaultApiConfig)
  );

  const [showConfig, setShowConfig] = useState(false);

  // Inicializar la aplicación
  useEffect(() => {
    initializeApp();
  }, []);

  // Inicializar base de datos y cargar configuración
  const initializeApp = async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      // Inicializar base de datos
      await dbManager.initialize();
      
      // Cargar sesiones existentes
      const sessions = await dbManager.getSessions();
      
      // Cargar configuración guardada
      const savedConfig = loadApiConfig();
      const config = { ...defaultApiConfig, ...savedConfig };
      
      const newApiManager = new ApiManager(config);
      setApiManager(newApiManager);
      
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
      
    } catch (error) {
      console.error('Error initializing app:', error);
      setAppState(prev => ({
        ...prev,
        error: 'Failed to initialize application',
        isLoading: false
      }));
    }
  };

  // Cargar configuración de API desde localStorage
  const loadApiConfig = (): Partial<ApiConfig> => {
    try {
      const saved = localStorage.getItem('em-chatbox-api-config');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  // Guardar configuración de API
  const saveApiConfig = (config: ApiConfig) => {
    try {
      localStorage.setItem('em-chatbox-api-config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  // Seleccionar sesión
  const selectSession = async (session: ChatSession) => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      const messages = await dbManager.getMessages(session.id);
      
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
        
        if (newCurrentSession) {
          const messages = await dbManager.getMessages(newCurrentSession.id);
          newMessages = messages;
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

  // Enviar mensaje
  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!appState.currentSession) {
      // Crear nueva sesión si no hay una activa
      const session = await createNewSession();
      if (!session) return;
    }

    try {
      setAppState(prev => ({ ...prev, isLoading: true, error: null }));

      // Procesar archivos adjuntos si los hay
      let fileAttachments = undefined;
      if (attachments && attachments.length > 0) {
        // Aquí procesarías los archivos usando window.electronAPI
        // Por ahora los omitimos para simplicidad
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

      // Enviar a la API
      const response = await apiManager.sendMessage(content);
      
      if (response.error) {
        throw new Error(response.error);
      }

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
      console.error('Error sending message:', error);
      setAppState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send message',
        isLoading: false
      }));
    }
  };

  // Actualizar configuración de API
  const updateApiConfig = (newConfig: ApiConfig) => {
    apiManager.updateConfig(newConfig);
    setApiManager(new ApiManager(newConfig));
    
    setAppState(prev => ({
      ...prev,
      apiConfig: newConfig
    }));
    
    saveApiConfig(newConfig);
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
          apiManager={apiManager}
        />
      )}
    </div>
  );
};

export default App;
