import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

interface ScrollToBottomProps {
  containerRef: React.RefObject<HTMLDivElement>;
  messagesCount: number;
  onScrollToBottom: () => void;
}

const ScrollToBottom: React.FC<ScrollToBottomProps> = ({
  containerRef,
  messagesCount,
  onScrollToBottom
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState(messagesCount);

  // Detectar si el usuario está cerca del final del scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsVisible(!isNearBottom);
      
      // Si está cerca del final, marcar como visto
      if (isNearBottom) {
        setLastSeenCount(messagesCount);
        setUnreadCount(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, messagesCount]);

  // Actualizar contador de mensajes no leídos
  useEffect(() => {
    if (messagesCount > lastSeenCount) {
      setUnreadCount(messagesCount - lastSeenCount);
    }
  }, [messagesCount, lastSeenCount]);

  const handleClick = () => {
    onScrollToBottom();
    setLastSeenCount(messagesCount);
    setUnreadCount(0);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="scroll-to-bottom-btn"
      title={unreadCount > 0 ? `${unreadCount} new messages` : 'Go to bottom'}
      style={{
        position: 'absolute',
        bottom: '80px', // Encima del input area
        right: 'var(--spacing-md)',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.3s ease',
        zIndex: 100,
        animation: 'slideUp 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent-primary)';
        e.currentTarget.style.color = 'var(--bg-primary)';
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-secondary)';
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {unreadCount > 0 ? (
        <div style={{ position: 'relative' }}>
          <MessageCircle size={20} />
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--error)',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              minWidth: '18px'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      ) : (
        <ChevronDown size={20} />
      )}
    </button>
  );
};

export default ScrollToBottom;