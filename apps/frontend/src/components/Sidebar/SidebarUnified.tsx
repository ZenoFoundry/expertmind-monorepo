import React, { useState } from 'react';
import { UnifiedConversation } from '../../types/chat-backend';
import { UserProfile } from '../Auth';
import styles from './Sidebar.module.css';

interface SidebarUnifiedProps {
  conversations: UnifiedConversation[];
  activeConversation: UnifiedConversation | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: (name?: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onShowConfig: () => void;
  onOpenAuthModal: () => void;
  isAuthenticated?: boolean;
  mode?: 'online' | 'offline';
}

export const SidebarUnified: React.FC<SidebarUnifiedProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onShowConfig,
  onOpenAuthModal,
  isAuthenticated = false,
  mode = 'offline'
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');

  const handleCreateConversation = () => {
    const name = newConversationName.trim() || `Chat ${new Date().toLocaleString()}`;
    onCreateConversation(name);
    setNewConversationName('');
    setShowCreateModal(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(conversationId);
    }
  };

  const getConversationIcon = (conversation: UnifiedConversation) => {
    return conversation.source === 'backend' ? '🌐' : '📱';
  };

  const getConversationSourceText = (conversation: UnifiedConversation) => {
    return conversation.source === 'backend' ? 'Cloud' : 'Local';
  };

  // Agrupar conversaciones por fuente
  const groupedConversations = conversations.reduce((groups, conv) => {
    const source = conv.source;
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(conv);
    return groups;
  }, {} as Record<string, UnifiedConversation[]>);

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>ExpertBot</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.newChatButton}
              onClick={() => setShowCreateModal(true)}
              title="New conversation"
            >
              ➕
            </button>
            <button
              className={styles.configButton}
              onClick={onShowConfig}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* User Profile - usando el mismo componente de la legacy */}
      <div className={styles.userProfileContainer}>
        <UserProfile onOpenAuthModal={onOpenAuthModal} />
      </div>

      {/* Conversaciones agrupadas */}
      <div className={styles.conversationsList}>
        {Object.entries(groupedConversations).map(([source, convs]) => (
          <div key={source} style={{ marginBottom: '16px' }}>
            {/* Header del grupo */}
            <div 
              style={{ 
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary, #6b7280)',
                marginBottom: '8px',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {source === 'backend' ? '🌐 Cloud Conversations' : '📱 Local Conversations'}
              <span style={{ 
                backgroundColor: 'var(--bg-tertiary, #f3f4f6)',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '10px'
              }}>
                {convs.length}
              </span>
            </div>

            {/* Lista de conversaciones del grupo */}
            {convs.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${
                  activeConversation?.id === conversation.id ? styles.active : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className={styles.conversationContent}>
                  <div className={styles.conversationHeader}>
                    <span className={styles.conversationIcon}>
                      {getConversationIcon(conversation)}
                    </span>
                    <span className={styles.conversationTitle}>
                      {conversation.title}
                    </span>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className={styles.conversationMeta}>
                    <span>{conversation.messageCount} messages</span>
                    <span>•</span>
                    <span>{conversation.model}</span>
                    {conversation.provider && (
                      <>
                        <span>•</span>
                        <span>{conversation.provider}</span>
                      </>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className={styles.lastMessage}>
                      <strong>{conversation.lastMessage.role}:</strong>{' '}
                      {conversation.lastMessage.content}
                    </div>
                  )}
                  
                  <div className={styles.conversationTime}>
                    {conversation.lastActivity.toLocaleDateString()} {conversation.lastActivity.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {conversations.length === 0 && (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p>No conversations yet</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
              Create your first conversation to get started
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear conversación */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Create New Conversation</h3>
            <input
              type="text"
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
              placeholder="Conversation name (optional)"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateConversation();
                } else if (e.key === 'Escape') {
                  setShowCreateModal(false);
                }
              }}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button onClick={handleCreateConversation}>
                Create
              </button>
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary, #6b7280)',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              Will be saved {mode === 'online' ? 'to cloud' : 'locally'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarUnified;
