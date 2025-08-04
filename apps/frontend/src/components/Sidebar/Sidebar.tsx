import React, { useState } from 'react';
import { ChatSession } from '../../types';
import { Plus, Settings, Trash2, MessageSquare } from 'lucide-react';
import styles from './Sidebar.module.css';

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
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>
            ExpertBot
          </h1>
          <button 
            className={`btn ${styles.settingsButton}`}
            onClick={onShowConfig}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
        
        {/* New Session Button/Input */}
        <div className={styles.newSessionContainer}>
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
              className={`input ${styles.newSessionInput}`}
              autoFocus
            />
          ) : (
            <button 
              className={`btn btn-primary ${styles.newSessionButton}`}
              onClick={handleCreateSession}
            >
              <Plus size={16} />
              New Chat
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className={styles.sessionsList}>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={32} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No conversations yet</p>
            <p className={styles.emptySubtext}>
              Create your first chat to get started
            </p>
          </div>
        ) : (
          <div className={styles.sessionsContainer}>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`${styles.sessionItem} ${
                  currentSession?.id === session.id ? styles.active : ''
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className={styles.sessionContent}>
                  <div className={styles.sessionName}>
                    {session.name}
                  </div>
                  <div className={styles.sessionMeta}>
                    {formatDate(session.updatedAt)} • {session.messageCount} messages
                  </div>
                </div>
                
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this conversation?')) {
                      onDeleteSession(session.id);
                    }
                  }}
                  title="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>Electron + React + AI</p>
      </div>
    </div>
  );
};

export default Sidebar;
