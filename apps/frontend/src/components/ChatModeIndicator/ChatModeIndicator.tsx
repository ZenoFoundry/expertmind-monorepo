import React from 'react';
import { useChatMode } from '../../hooks/chat';
import { ChatMode } from '../../types/chat-backend';

interface ChatModeIndicatorProps {
  onSwitchMode?: (mode: ChatMode) => void;
  showSwitcher?: boolean;
  compact?: boolean;
}

export const ChatModeIndicator: React.FC<ChatModeIndicatorProps> = ({
  onSwitchMode,
  showSwitcher = true,
  compact = false
}) => {
  const { mode, isAuthenticated, isOnline, canUseBackend, switchToOnline, switchToOffline } = useChatMode();

  const handleSwitchMode = (newMode: ChatMode) => {
    if (newMode === 'online' && canUseBackend) {
      switchToOnline();
    } else {
      switchToOffline();
    }
    onSwitchMode?.(newMode);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'online':
        return '🌐';
      case 'offline':
        return '📱';
      default:
        return '❓';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'online':
        return 'Conversations synced to cloud';
      case 'offline':
        return 'Conversations stored locally';
      default:
        return 'Mode unknown';
    }
  };

  const getStatusColor = () => {
    switch (mode) {
      case 'online':
        return '#10b981'; // green
      case 'offline':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: getStatusColor(),
          fontWeight: '500'
        }}
        title={getModeDescription()}
      >
        <span>{getModeIcon()}</span>
        <span>{getModeText()}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-secondary, #f3f4f6)',
        borderRadius: '6px',
        border: `1px solid ${getStatusColor()}`,
        fontSize: '14px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor()
          }}
        />
        <div>
          <div style={{ fontWeight: '500', color: 'var(--text-primary, #111827)' }}>
            {getModeIcon()} {getModeText()} Mode
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>
            {getModeDescription()}
          </div>
        </div>
      </div>

      {showSwitcher && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => handleSwitchMode('offline')}
            disabled={mode === 'offline'}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: mode === 'offline' ? '#e5e7eb' : 'white',
              color: mode === 'offline' ? '#6b7280' : '#374151',
              cursor: mode === 'offline' ? 'default' : 'pointer'
            }}
            title="Switch to offline mode (localStorage)"
          >
            📱 Local
          </button>
          
          <button
            onClick={() => handleSwitchMode('online')}
            disabled={!canUseBackend || mode === 'online'}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: mode === 'online' ? '#e5e7eb' : 'white',
              color: (!canUseBackend || mode === 'online') ? '#6b7280' : '#374151',
              cursor: (!canUseBackend || mode === 'online') ? 'default' : 'pointer'
            }}
            title={!isAuthenticated ? 'Login required' : !isOnline ? 'Internet required' : 'Switch to online mode (cloud)'}
          >
            🌐 Cloud
          </button>
        </div>
      )}

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '8px' }}>
          Auth: {isAuthenticated ? '✅' : '❌'} | 
          Net: {isOnline ? '🟢' : '🔴'}
        </div>
      )}
    </div>
  );
};

export default ChatModeIndicator;
