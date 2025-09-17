import React, { useEffect, useRef } from 'react';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';
import ScrollToBottom from '../ScrollToBottom';
import { useScrollManager } from '../../hooks';
import { UnifiedMessage, UnifiedConversation } from '../../types/chat-backend';

interface ChatAreaUnifiedProps {
  conversation: UnifiedConversation | null;
  messages: UnifiedMessage[];
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  className?: string;
}

export const ChatAreaUnified: React.FC<ChatAreaUnifiedProps> = ({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  className = ''
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {
    shouldShowScrollToBottom,
    handleScroll,
    scrollToBottom
  } = useScrollManager(messagesContainerRef);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      // Solo auto-scroll si estábamos cerca del final
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
        if (isNearBottom) {
          setTimeout(scrollToBottom, 100);
        }
      }
    }
  }, [messages.length, scrollToBottom]);

  // Convertir mensajes unificados al formato esperado por MessageList
  const adaptedMessages = messages
    .filter(msg => {
      // Filtrar mensajes vacíos o solo con espacios en blanco
      return msg.content && msg.content.trim().length > 0;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      sessionId: msg.conversationId,
      attachments: msg.attachments?.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        path: att.url || att.path || '',
        uploadedAt: msg.timestamp
      }))
    }));

  const adaptedSession = conversation ? {
    id: conversation.id,
    name: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messageCount: conversation.messageCount
  } : null;

  const handleSendMessageInternal = async (content: string, attachments?: File[]) => {
    try {
      await onSendMessage(content, attachments);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!conversation) {
    return (
      <div className={`chat-area ${className}`}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '16px',
            color: 'var(--text-secondary, #6b7280)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '48px' }}>💬</div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary, #111827)' }}>
              No conversation selected
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Create a new conversation or select an existing one to start chatting
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-area ${className}`}>
      {/* Lista de mensajes */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px'
        }}
      >
        <MessageList
          messages={adaptedMessages}
          currentSession={adaptedSession}
          isLoading={isLoading}
        />
      </div>

      {/* Botón scroll to bottom */}
      {shouldShowScrollToBottom && (
        <ScrollToBottom onClick={scrollToBottom} />
      )}

      {/* Input para nuevos mensajes */}
      <div style={{ borderTop: '1px solid var(--border-color, #e5e7eb)' }}>
        <MessageInput
          onSendMessage={handleSendMessageInternal}
          disabled={isLoading}
          placeholder={
            conversation.source === 'backend' 
              ? 'Type a message... (synced to cloud)' 
              : 'Type a message... (stored locally)'
          }
        />
      </div>
    </div>
  );
};

export default ChatAreaUnified;
