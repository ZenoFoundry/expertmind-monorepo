import React from 'react';
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
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Header */}
      <div 
        className="p-md"
        style={{ 
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)'
        }}
      >
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
          
          {isLoading && (
            <div className="flex items-center gap-sm">
              <div className="spinner" />
              <span style={{ 
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                Thinking...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages}
        isLoading={isLoading}
      />

      {/* Input */}
      <MessageInput 
        onSendMessage={onSendMessage}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatArea;
