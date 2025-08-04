import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Message } from '../../types';
import MessageItem from '../MessageItem/MessageItem';
import ScrollToBottom from '../ScrollToBottom/ScrollToBottom';
import ScrollIndicator from '../ScrollIndicator/ScrollIndicator';
import { useScrollManager } from '../../hooks';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Use the scroll manager hook
  const { scrollState, scrollTo } = useScrollManager(containerRef, {
    threshold: 50,
    debounceMs: 100
  });

  // Auto-scroll to bottom when new messages arrive (only if user was already at bottom)
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Always auto-scroll when loading starts
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Update auto-scroll behavior based on scroll state
  useEffect(() => {
    setShouldAutoScroll(scrollState.isAtBottom);
  }, [scrollState.isAtBottom]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    // Fallback
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, []);

  const handleScrollTo = useCallback((position: 'top' | 'bottom') => {
    if (position === 'bottom') {
      scrollToBottom();
    } else {
      scrollTo(position, true);
    }
  }, [scrollTo, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div 
        style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
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
      style={{ 
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}
    >
      {/* Messages container - VOLVER A FLEXBOX PERO CON ALTURA CALCULADA */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'var(--spacing-md)',
          scrollBehavior: 'smooth',
          // CRÍTICO: Forzar altura específica con calc
          minHeight: 0,
          maxHeight: 'calc(100vh - 200px)' // Deja espacio para header e input
        }}
      >
        {/* Content wrapper */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          paddingBottom: 'var(--spacing-xl)' // Extra space at bottom
        }}>
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
          
          {/* Scroll target */}
          <div ref={messagesEndRef} style={{ height: '1px', flexShrink: 0 }} />
        </div>
      </div>

      {/* Enhanced scroll controls */}
      <ScrollToBottom
        containerRef={containerRef}
        messagesCount={messages.length}
        onScrollToBottom={scrollToBottom}
      />

      {/* Scroll indicator - only show if there are enough messages */}
      {messages.length > 3 && (
        <ScrollIndicator
          scrollPercentage={scrollState.scrollPercentage}
          isAtTop={scrollState.isAtTop}
          isAtBottom={scrollState.isAtBottom}
          onScrollTo={handleScrollTo}
          messagesCount={messages.length}
        />
      )}
    </div>
  );
};

export default MessageList;