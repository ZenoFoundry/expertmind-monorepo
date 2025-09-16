// Re-export all components for easier importing
export { default as ChatArea } from './ChatArea';
export { ConfigPanel, ConfigPanelUnified } from './ConfigPanel';
export { default as MessageInput } from './MessageInput';
export { default as MessageItem } from './MessageItem';
export { default as MessageList } from './MessageList';
export { default as ScrollIndicator } from './ScrollIndicator';
export { default as ScrollToBottom } from './ScrollToBottom';
export { default as Sidebar } from './Sidebar';

// Auth components
export { AuthProvider, AuthModal, LoginForm, RegisterForm, UserProfile, useAuth } from './Auth';

// Unified components
export { ChatModeIndicator } from './ChatModeIndicator';
export { default as ChatAreaUnified } from './ChatArea/ChatAreaUnified';
export { default as SidebarUnified } from './Sidebar/SidebarUnified';
export { UnifiedHeader } from './UnifiedHeader';
