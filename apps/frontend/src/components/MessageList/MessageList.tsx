import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import MessageItem from '../MessageItem/MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div 
          className="flex-1 flex items-center justify-center flex-col"
          style={{ color: 'var(--text-muted)' }}
        >
          <div style={{ 
            padding: 'var(--spacing-xl)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem',
              marginBottom: 'var(--spacing-md)',
              opacity: 0.3
            }}>
              💬
            </div>
            <p style={{ 
              fontSize: '0.9rem',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Start the conversation
            </p>
            <p style={{ 
              fontSize: '0.8rem',
              opacity: 0.7
            }}>
              Type your message below to begin
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="messages-container"
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)'
      }}
    >
      {messages.map((message, index) => (
        <MessageItem 
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
      
      {isLoading && (
        <div className="message assistant">
          <div className="message-content" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--text-muted)'
          }}>
            <div className="spinner" />
            <span style={{ fontSize: '0.85rem' }}>
              AI is thinking...
            </span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
