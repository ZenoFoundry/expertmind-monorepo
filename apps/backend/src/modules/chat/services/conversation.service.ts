import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../entities/conversation.entity';
import { 
  IConversationService, 
  CreateConversationData, 
  UpdateConversationData, 
  FindOptions, 
  PaginationOptions, 
  PaginatedResult 
} from '../interfaces/chat.interface';

@Injectable()
export class ConversationService implements IConversationService {
  // En una implementación real, esto sería inyectado como un repositorio
  private conversations: Map<string, Conversation> = new Map();

  async create(data: CreateConversationData & { userId: string }): Promise<Conversation> {
    const id = `conv_${uuidv4()}`;
    const now = new Date();

    const conversation: Conversation = {
      id,
      title: data.title,
      userId: data.userId,
      aiProvider: data.aiProvider,
      model: data.model,
      systemPrompt: data.systemPrompt,
      settings: data.settings || {},
      messageCount: 0,
      lastActivity: now,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      metadata: {}
    };

    this.conversations.set(id, conversation);
    return conversation;
  }

  async findByUser(userId: string, options: FindOptions = {}): Promise<Conversation[]> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId);

    // Aplicar filtros
    let filtered = userConversations;
    if (options.where) {
      filtered = filtered.filter(conv => {
        return Object.entries(options.where!).every(([key, value]) => {
          return (conv as any)[key] === value;
        });
      });
    }

    // Aplicar ordenamiento
    if (options.orderBy) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[options.orderBy!];
        const bVal = (b as any)[options.orderBy!];
        const order = options.order === 'ASC' ? 1 : -1;
        
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    } else {
      // Ordenar por lastActivity por defecto
      filtered.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    }

    // Aplicar paginación
    if (options.limit) {
      const offset = options.offset || 0;
      filtered = filtered.slice(offset, offset + options.limit);
    }

    return filtered;
  }

  async findByUserPaginated(userId: string, options: PaginationOptions): Promise<PaginatedResult<Conversation>> {
    // Aplicar valores por defecto
    const page = options.page || 1;
    const limit = options.limit || 20;
    const sortBy = options.sortBy || 'lastActivity';
    const sortOrder = options.sortOrder || 'desc';

    let conversations = Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId);

    // Aplicar búsqueda
    if (options.search) {
      const search = options.search.toLowerCase();
      conversations = conversations.filter(conv => 
        conv.title.toLowerCase().includes(search) ||
        conv.model.toLowerCase().includes(search)
      );
    }

    const total = conversations.length;

    // Aplicar ordenamiento
    const order = sortOrder === 'asc' ? 1 : -1;
    
    conversations.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * order;
      }
      
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

    // Aplicar paginación
    const offset = (page - 1) * limit;
    const paginatedData = conversations.slice(offset, offset + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1
      }
    };
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async update(id: string, data: UpdateConversationData): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    const updatedConversation: Conversation = {
      ...conversation,
      ...data,
      updatedAt: new Date()
    };

    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async delete(id: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    this.conversations.delete(id);
  }

  async incrementMessageCount(id: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    conversation.messageCount += 1;
    conversation.updatedAt = new Date();
    this.conversations.set(id, conversation);
  }

  async updateLastActivity(id: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    conversation.lastActivity = new Date();
    conversation.updatedAt = new Date();
    this.conversations.set(id, conversation);
  }

  async validateOwnership(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }
}
