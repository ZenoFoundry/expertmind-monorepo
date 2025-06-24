import React, { useState } from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isLast }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  // Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Render file attachments
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) {
      return null;
    }

    return (
      <div style={{
        marginTop: 'var(--spacing-sm)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-xs)'
      }}>
        {message.attachments.map((attachment) => (
          <div
            key={attachment.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)'
            }}
          >
            <span>📎</span>
            <span>{attachment.name}</span>
            <span style={{ opacity: 0.6 }}>
              ({(attachment.size / 1024).toFixed(1)}KB)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`message ${message.role}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
        marginBottom: isLast ? 'var(--spacing-lg)' : 'var(--spacing-sm)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Message Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: 'var(--spacing-sm)',
        opacity: isHovered ? 1 : 0.7,
        transition: 'opacity 0.2s ease'
      }}>
        {!isUser && (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            AI
          </div>
        )}
        
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontWeight: '500'
        }}>
          {isUser ? 'You' : 'Assistant'}
        </span>
        
        <span style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          opacity: 0.6
        }}>
          {formatTime(message.timestamp)}
        </span>

        {/* Copy button */}
        {isHovered && (
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--spacing-xs)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              opacity: 0.6,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Copy message"
          >
            📋
          </button>
        )}

        {isUser && (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: 'white'
          }}>
            👤
          </div>
        )}
      </div>

      {/* Message Content */}
      <div
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          minWidth: '200px'
        }}
      >
        <div
          className={`message-content ${message.role}`}
          style={{
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius)',
            backgroundColor: isUser 
              ? 'var(--primary-color)' 
              : 'var(--bg-tertiary)',
            color: isUser 
              ? 'white' 
              : 'var(--text-primary)',
            lineHeight: '1.5',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            ...(isUser ? {
              borderBottomRightRadius: '6px'
            } : {
              borderBottomLeftRadius: '6px'
            })
          }}
        >
          {/* Message bubble tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              [isUser ? 'right' : 'left']: '-6px',
              width: '0',
              height: '0',
              borderStyle: 'solid',
              borderWidth: isUser 
                ? '0 0 12px 12px'
                : '0 12px 12px 0',
              borderColor: isUser
                ? `transparent transparent var(--primary-color) transparent`
                : `transparent var(--bg-tertiary) transparent transparent`
            }}
          />
          
          {message.content}
        </div>

        {/* File attachments */}
        {renderAttachments()}
      </div>
    </div>
  );
};

export default MessageItem;