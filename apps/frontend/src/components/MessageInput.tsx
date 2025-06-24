import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage || attachments.length > 0) {
      onSendMessage(trimmedMessage, attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files);
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="input-area">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div style={{ 
          marginBottom: 'var(--spacing-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-xs)'
        }}>
          {attachments.map((file, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Paperclip size={12} />
              <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                ({formatFileSize(file.size)})
              </span>
              <button
                onClick={() => removeAttachment(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '2px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--error)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="input-container">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="btn"
          style={{
            padding: 'var(--spacing-sm)',
            minWidth: 'auto',
            height: '40px'
          }}
          title="Attach files"
        >
          <Paperclip size={16} />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          className="input message-input"
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            resize: 'none',
            overflow: 'hidden',
            lineHeight: '1.4'
          }}
        />

        <button
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="btn btn-primary"
          style={{
            padding: 'var(--spacing-sm)',
            minWidth: 'auto',
            height: '40px'
          }}
          title="Send message"
        >
          <Send size={16} />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="*/*"
        />
      </div>

      {/* Help text */}
      <div style={{
        marginTop: 'var(--spacing-xs)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <kbd style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '3px',
          padding: '1px 4px',
          fontSize: '0.7rem'
        }}>
          Enter
        </kbd> to send • <kbd style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '3px',
          padding: '1px 4px',
          fontSize: '0.7rem'
        }}>
          Shift+Enter
        </kbd> for new line
      </div>
    </div>
  );
};

export default MessageInput;