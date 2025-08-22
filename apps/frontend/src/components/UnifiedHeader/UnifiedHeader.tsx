import React from 'react';
import { UnifiedConversation } from '../../types/chat-backend';

interface UnifiedHeaderProps {
  conversation: UnifiedConversation | null;
  isLoading: boolean;
  mode: 'online' | 'offline';
  isAuthenticated: boolean;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  conversation,
  isLoading,
  mode,
  isAuthenticated
}) => {
  const getModeIcon = () => {
    return mode === 'online' ? '🌐' : '📱';
  };

  const getModeText = () => {
    return mode === 'online' ? 'Cloud Mode' : 'Local Mode';
  };

  const getConversationInfo = () => {
    if (!conversation) return null;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>
        <span>📊 {conversation.messageCount} messages</span>
        <span>🤖 {conversation.model}</span>
        {conversation.provider && <span>🔧 {conversation.provider}</span>}
        <span>💾 {conversation.source === 'backend' ? 'Cloud' : 'Local'}</span>
      </div>
    );
  };

  return (
    <div 
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color, #e5e7eb)',
        backgroundColor: 'var(--bg-secondary, #f9fafb)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '60px'
      }}
    >
      {/* Información de la conversación */}
      <div style={{ flex: 1 }}>
        {conversation ? (
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary, #111827)' }}>
              {conversation.title}
            </h3>
            {getConversationInfo()}
          </div>
        ) : (
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary, #6b7280)' }}>
              ExpertMind Chat
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>
              Select or create a conversation to start chatting
            </div>
          </div>
        )}
      </div>

      {/* Estado y controles del lado derecho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Indicador de estado de carga */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary, #6b7280)' }}>
            <div className="spinner" style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px' }}>Processing...</span>
          </div>
        )}

        {/* Indicador de modo */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '4px 8px',
            backgroundColor: mode === 'online' ? 'var(--accent-dark, #006064)' : 'var(--bg-tertiary, #2a2a2a)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--text-primary, #ffffff)'
          }}
        >
          <span>{getModeIcon()}</span>
          <span>{getModeText()}</span>
        </div>

        {/* Indicador de autenticación */}
        {isAuthenticated ? (
          <div 
            style={{ 
              padding: '4px 8px',
              backgroundColor: 'var(--success, #4caf50)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>✓</span>
            <span>Signed In</span>
          </div>
        ) : (
          <div 
            style={{ 
              padding: '4px 8px',
              backgroundColor: 'var(--bg-tertiary, #2a2a2a)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--text-secondary, #b0b0b0)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>○</span>
            <span>Local Only</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedHeader;
