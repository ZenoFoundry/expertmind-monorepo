import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

// ===============================
// chat.interface.ts
// ===============================

export interface IChatService {
  createConversation(userId: string, data: CreateConversationData): Promise<Conversation>;
  getUserConversations(userId: string, pagination: PaginationOptions): Promise<PaginatedResult<Conversation>>;
  getConversation(conversationId: string, userId: string): Promise<Conversation>;
  updateConversation(conversationId: string, userId: string, data: UpdateConversationData): Promise<Conversation>;
  deleteConversation(conversationId: string, userId: string): Promise<void>;
  sendMessage(conversationId: string, userId: string, data: SendMessageData): Promise<Message>;
  getMessages(conversationId: string, userId: string, pagination: PaginationOptions): Promise<PaginatedResult<Message>>;
}

export interface IConversationService {
  create(data: CreateConversationData & { userId: string }): Promise<Conversation>;
  findByUser(userId: string, options: FindOptions): Promise<Conversation[]>;
  findById(id: string): Promise<Conversation | null>;
  update(id: string, data: UpdateConversationData): Promise<Conversation>;
  delete(id: string): Promise<void>;
  incrementMessageCount(id: string): Promise<void>;
  updateLastActivity(id: string): Promise<void>;
}

export interface IMessageService {
  create(data: CreateMessageData): Promise<Message>;
  findByConversation(conversationId: string, options: FindOptions): Promise<Message[]>;
  findById(id: string): Promise<Message | null>;
  update(id: string, data: UpdateMessageData): Promise<Message>;
  delete(id: string): Promise<void>;
  getNextSequenceNumber(conversationId: string): Promise<number>;
}

// ===============================
// common.interface.ts
// ===============================

export interface FindOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateConversationData {
  title: string;
  aiProvider: 'ollama' | 'anthropic' | 'openai';
  model: string;
  systemPrompt?: string;
  settings?: Record<string, any>;
}

export interface UpdateConversationData {
  title?: string;
  aiProvider?: 'ollama' | 'anthropic' | 'openai';
  model?: string;
  systemPrompt?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface SendMessageData {
  content: string;
  parentMessageId?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    data: string;
  }>;
  overrideSettings?: Record<string, any>;
}

export interface CreateMessageData {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parentMessageId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  metadata?: Record<string, any>;
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
}

export interface UpdateMessageData {
  content?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  metadata?: Record<string, any>;
}

// ===============================
// event.interface.ts
// ===============================

export interface ChatEvent {
  type: 'message_sent' | 'message_received' | 'conversation_created' | 'conversation_updated' | 'typing' | 'error';
  conversationId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageStreamEvent {
  conversationId: string;
  messageId: string;
  chunk: string;
  isComplete: boolean;
  metadata?: Record<string, any>;
}
