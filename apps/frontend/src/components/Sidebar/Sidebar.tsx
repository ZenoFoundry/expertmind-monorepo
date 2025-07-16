import React, { useState } from 'react';
import { ChatSession } from '../../types';
import { Plus, Settings, Trash2, MessageSquare } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (session: ChatSession) => void;
  onCreateSession: (name?: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onShowConfig: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onShowConfig
}) => {
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const handleCreateSession = () => {
    if (showNewSessionInput) {
      const name = newSessionName.trim();
      onCreateSession(name || undefined);
      setNewSessionName('');
      setShowNewSessionInput(false);
    } else {
      setShowNewSessionInput(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSession();
    } else if (e.key === 'Escape') {
      setShowNewSessionInput(false);
      setNewSessionName('');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="p-md" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-md">
          <h1 style={{ 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            color: 'var(--accent-primary)' 
          }}>
            ExpertBot
          </h1>
          <button 
            className="btn" 
            onClick={onShowConfig}
            title="Settings"
            style={{ padding: '4px 8px' }}
          >
            <Settings size={16} />
          </button>
        </div>
        
        {/* New Session Button/Input */}
        <div className="flex gap-sm">
          {showNewSessionInput ? (
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newSessionName.trim()) {
                  setShowNewSessionInput(false);
                }
              }}
              placeholder="Session name..."
              className="input flex-1"
              autoFocus
              style={{ fontSize: '0.85rem', padding: '6px 8px' }}
            />
          ) : (
            <button 
              className="btn btn-primary flex-1" 
              onClick={handleCreateSession}
            >
              <Plus size={16} />
              New Chat
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1" style={{ overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <div className="p-md text-center" style={{ color: 'var(--text-muted)' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>No conversations yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Create your first chat to get started
            </p>
          </div>
        ) : (
          <div className="p-sm">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => onSelectSession(session)}
                style={{
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  marginBottom: 'var(--spacing-xs)',
                  backgroundColor: currentSession?.id === session.id 
                    ? 'var(--accent-dark)' 
                    : 'transparent',
                  border: '1px solid',
                  borderColor: currentSession?.id === session.id 
                    ? 'var(--accent-primary)' 
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  group: true
                }}
                onMouseEnter={(e) => {
                  if (currentSession?.id !== session.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentSession?.id !== session.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div 
                      style={{ 
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {session.name}
                    </div>
                    <div 
                      style={{ 
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '2px'
                      }}
                    >
                      {formatDate(session.updatedAt)} • {session.messageCount} messages
                    </div>
                  </div>
                  
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this conversation?')) {
                        onDeleteSession(session.id);
                      }
                    }}
                    style={{
                      padding: '4px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-sm)',
                      opacity: 0,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--error)';
                      e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="p-sm"
        style={{ 
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}
      >
        <p>Electron + React + AI</p>
      </div>

      <style jsx>{`
        .session-item:hover .delete-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
