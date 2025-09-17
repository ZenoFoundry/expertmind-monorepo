import React, { useState } from 'react';
import { AuthProvider, AuthModal } from './components/Auth';
import { UnifiedHeader } from './components/UnifiedHeader';
import { ChatAreaUnified } from './components/ChatArea';
import { SidebarUnified } from './components/Sidebar';
import { ConfigPanelUnified } from './components/ConfigPanel';
import { useChatState } from './hooks/chat/useChatState';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  // Estado para modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    mode,
    isAuthenticated,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    clearError,
    state,
    updateApiConfig
  } = useChatState();

  return (
    <div 
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--bg-primary, #ffffff)',
        color: 'var(--text-primary, #000000)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
        {/* Sidebar */}
        <div style={{ 
          width: '300px', 
          minWidth: '300px',
          borderRight: '1px solid var(--border-color, #e5e7eb)',
          backgroundColor: 'var(--bg-secondary, #f9fafb)'
        }}>
          <SidebarUnified
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            onCreateConversation={async (name?: string) => {
              await createConversation({
                title: name || `Chat ${new Date().toLocaleString()}`,
                model: 'gpt-4.1',
                provider: 'agno'  // Cambiado de 'ollama' a 'agno'
              });
            }}
            onDeleteConversation={async (conversationId: string) => {
              await deleteConversation(conversationId);
            }}
            onShowConfig={() => {
              setShowConfigModal(true);
            }}
            onOpenAuthModal={() => {
              setShowAuthModal(true);
            }}
            isAuthenticated={isAuthenticated}
            mode={mode}
          />
        </div>

        {/* Main Content Area */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0 // Important for flexbox overflow
        }}>
          {/* Header */}
          <UnifiedHeader
            conversation={activeConversation}
            isLoading={isLoading}
            mode={mode}
            isAuthenticated={isAuthenticated}
          />

          {/* Chat Area */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatAreaUnified
              conversation={activeConversation}
              messages={messages}
              isLoading={isLoading}
              onSendMessage={async (content: string, attachments?: File[]) => {
                try {
                  await sendMessage(content, { attachments });
                } catch (error) {
                  console.error('Error sending message:', error);
                }
              }}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div 
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                backgroundColor: 'var(--error-bg, #fee2e2)',
                border: '1px solid var(--error-border, #fca5a5)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--error-text, #dc2626)',
                fontSize: '14px',
                maxWidth: '400px',
                zIndex: 1000,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>{error}</div>
                <button
                  onClick={clearError}
                  style={{
                    marginLeft: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--error-text, #dc2626)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modales */}
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}

        {showConfigModal && (
          <ConfigPanelUnified
            apiConfig={state.apiConfig}
            onUpdateConfig={(newConfig) => {
              updateApiConfig(newConfig);
              setShowConfigModal(false);
            }}
            onClose={() => setShowConfigModal(false)}
          />
        )}
      </div>
  );
};

export default App;
