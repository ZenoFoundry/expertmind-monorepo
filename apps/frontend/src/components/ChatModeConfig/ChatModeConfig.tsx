import React, { useState } from 'react';
import { ChatConfig } from '../../types/chat-backend';
import { useChatMode } from '../../hooks/chat';

interface ChatModeConfigProps {
  config: ChatConfig;
  onUpdateConfig: (config: ChatConfig) => void;
  onClose: () => void;
}

export const ChatModeConfig: React.FC<ChatModeConfigProps> = ({
  config,
  onUpdateConfig,
  onClose
}) => {
  const [localConfig, setLocalConfig] = useState<ChatConfig>(config);
  const { mode, isAuthenticated, isOnline, canUseBackend } = useChatMode();

  const handleSave = () => {
    onUpdateConfig(localConfig);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: ChatConfig = {
      preferOnlineMode: true,
      autoSync: true,
      offlineFallback: true,
      maxOfflineConversations: 50,
      maxOfflineMessages: 1000
    };
    setLocalConfig(defaultConfig);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 16px 0' }}>Chat Mode Configuration</h2>
        
        {/* Estado actual */}
        <div 
          style={{
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            marginBottom: '20px'
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Current Status</h3>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <div>Mode: <strong>{mode}</strong></div>
            <div>Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong></div>
            <div>Online: <strong>{isOnline ? 'Yes' : 'No'}</strong></div>
            <div>Can use backend: <strong>{canUseBackend ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>

        {/* Configuraciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Prefer Online Mode */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={localConfig.preferOnlineMode}
              onChange={(e) => 
                setLocalConfig(prev => ({ ...prev, preferOnlineMode: e.target.checked }))
              }
            />
            <div>
              <div style={{ fontWeight: '500' }}>Prefer Online Mode</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Use cloud sync when authenticated and online
              </div>
            </div>
          </label>

          {/* Auto Sync */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={localConfig.autoSync}
              onChange={(e) => 
                setLocalConfig(prev => ({ ...prev, autoSync: e.target.checked }))
              }
            />
            <div>
              <div style={{ fontWeight: '500' }}>Auto Sync</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Automatically sync conversations when switching modes
              </div>
            </div>
          </label>

          {/* Offline Fallback */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={localConfig.offlineFallback}
              onChange={(e) => 
                setLocalConfig(prev => ({ ...prev, offlineFallback: e.target.checked }))
              }
            />
            <div>
              <div style={{ fontWeight: '500' }}>Offline Fallback</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Fall back to local storage if backend is unavailable
              </div>
            </div>
          </label>

          {/* Max Offline Conversations */}
          <div>
            <label style={{ fontWeight: '500', fontSize: '14px' }}>
              Max Offline Conversations
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={localConfig.maxOfflineConversations}
              onChange={(e) => 
                setLocalConfig(prev => ({ 
                  ...prev, 
                  maxOfflineConversations: parseInt(e.target.value) || 50 
                }))
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                marginTop: '4px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Maximum number of conversations to store locally
            </div>
          </div>

          {/* Max Offline Messages */}
          <div>
            <label style={{ fontWeight: '500', fontSize: '14px' }}>
              Max Offline Messages
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={localConfig.maxOfflineMessages}
              onChange={(e) => 
                setLocalConfig(prev => ({ 
                  ...prev, 
                  maxOfflineMessages: parseInt(e.target.value) || 1000 
                }))
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                marginTop: '4px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Maximum number of messages to store locally
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '24px',
            gap: '8px'
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Reset to Defaults
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModeConfig;
