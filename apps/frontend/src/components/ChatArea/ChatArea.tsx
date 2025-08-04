import React, { useEffect, useCallback } from 'react';
import { Message, ChatSession } from '../../types';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import { MessageSquare } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: File[]) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentSession,
  isLoading,
  onSendMessage
}) => {
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't interfere if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Ctrl/Cmd + End: Go to bottom of chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'End') {
      e.preventDefault();
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
    
    // Ctrl/Cmd + Home: Go to top of chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
      e.preventDefault();
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }

    // Page Down: Scroll down by viewport height
    if (e.key === 'PageDown') {
      e.preventDefault();
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollBy({
          top: container.clientHeight * 0.8,
          behavior: 'smooth'
        });
      }
    }

    // Page Up: Scroll up by viewport height
    if (e.key === 'PageUp') {
      e.preventDefault();
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollBy({
          top: -container.clientHeight * 0.8,
          behavior: 'smooth'
        });
      }
    }

    // Space: Scroll down
    if (e.key === ' ' && !e.shiftKey) {
      e.preventDefault();
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollBy({
          top: container.clientHeight * 0.5,
          behavior: 'smooth'
        });
      }
    }

    // Shift + Space: Scroll up
    if (e.key === ' ' && e.shiftKey) {
      e.preventDefault();
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollBy({
          top: -container.clientHeight * 0.5,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!currentSession) {
    return (
      <div className="chat-area">
        <div 
          className="flex-1 flex items-center justify-center flex-col"
          style={{ color: 'var(--text-muted)' }}
        >
          <MessageSquare 
            size={64} 
            style={{ 
              opacity: 0.3,
              marginBottom: 'var(--spacing-md)'
            }} 
          />
          <h2 style={{ 
            fontSize: '1.2rem',
            fontWeight: '500',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--text-secondary)'
          }}>
            Welcome to ExpertBot
          </h2>
          <p style={{ 
            fontSize: '0.9rem',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '400px'
          }}>
            Select an existing conversation from the sidebar or create a new one to start chatting with AI.
          </p>
          <div style={{ 
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            maxWidth: '500px'
          }}>
            <h3 style={{ 
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--accent-primary)'
            }}>
              Features:
            </h3>
            <ul style={{ 
              fontSize: '0.85rem',
              lineHeight: 1.4,
              paddingLeft: 'var(--spacing-md)'
            }}>
              <li>• Persistent conversation history</li>
              <li>• File attachments support</li>
              <li>• Configurable AI API</li>
              <li>• Dark minimalist interface</li>
              <li>• Local SQLite database</li>
            </ul>
          </div>
          
          {/* Keyboard shortcuts info */}
          <div style={{ 
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color)',
            maxWidth: '500px'
          }}>
            <h4 style={{ 
              fontSize: '0.8rem',
              fontWeight: '500',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-secondary)'
            }}>
              Keyboard Shortcuts:
            </h4>
            <div style={{ 
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-xs)'
            }}>
              <span><kbd>Ctrl+End</kbd> Go to bottom</span>
              <span><kbd>Ctrl+Home</kbd> Go to top</span>
              <span><kbd>PageDown</kbd> Scroll down</span>
              <span><kbd>PageUp</kbd> Scroll up</span>
              <span><kbd>Space</kbd> Scroll down</span>
              <span><kbd>Shift+Space</kbd> Scroll up</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area-container">
      {/* Header - Fixed */}
      <div className="chat-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ 
              fontSize: '1rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: '2px'
            }}>
              {currentSession.name}
            </h2>
            <p style={{ 
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              {messages.length} messages • Created {currentSession.createdAt.toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-sm">
            {isLoading && (
              <>
                <div className="spinner" />
                <span style={{ 
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  Thinking...
                </span>
              </>
            )}
            
            {/* Position indicator */}
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              padding: '2px 6px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <kbd>Ctrl+End</kbd> Bottom • <kbd>Ctrl+Home</kbd> Top
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="chat-messages-area">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      {/* Input Area - Fixed */}
      <div className="chat-input-fixed">
        <MessageInput 
          onSendMessage={onSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatArea;