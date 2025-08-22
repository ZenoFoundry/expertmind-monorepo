// Re-export all components for easier importing
export { default as ChatArea } from './ChatArea';
export { default as ConfigPanel } from './ConfigPanel';
export { default as ConfigPanelOllama } from './ConfigPanelOllama';
export { default as MessageInput } from './MessageInput';
export { default as MessageItem } from './MessageItem';
export { default as MessageList } from './MessageList';
export { default as ScrollIndicator } from './ScrollIndicator';
export { default as ScrollToBottom } from './ScrollToBottom';
export { default as Sidebar } from './Sidebar';

// Auth components
export { AuthProvider, AuthModal, LoginForm, RegisterForm, UserProfile, useAuth } from './Auth';

// New unified components
export { ChatModeIndicator } from './ChatModeIndicator';
export { default as ChatAreaUnified } from './ChatArea/ChatAreaUnified';
export { default as SidebarUnified } from './Sidebar/SidebarUnified';
export { UnifiedHeader } from './UnifiedHeader';
