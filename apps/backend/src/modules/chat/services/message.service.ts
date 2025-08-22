import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../entities/message.entity';
import { 
  IMessageService, 
  CreateMessageData, 
  UpdateMessageData, 
  FindOptions, 
  PaginationOptions, 
  PaginatedResult 
} from '../interfaces/chat.interface';

@Injectable()
export class MessageService implements IMessageService {
  // En una implementación real, esto sería inyectado como un repositorio
  private messages: Map<string, Message> = new Map();

  async create(data: CreateMessageData): Promise<Message> {
    const id = `msg_${uuidv4()}`;
    const now = new Date();
    const sequenceNumber = await this.getNextSequenceNumber(data.conversationId);

    const message: Message = {
      id,
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      parentMessageId: data.parentMessageId,
      attachments: data.attachments,
      metadata: data.metadata || {},
      status: data.status || 'sent',
      error: data.error,
      sequenceNumber,
      createdAt: now,
      updatedAt: now
    };

    this.messages.set(id, message);
    return message;
  }

  async findByConversation(conversationId: string, options: FindOptions = {}): Promise<Message[]> {
    const conversationMessages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId);

    // Aplicar filtros
    let filtered = conversationMessages;
    if (options.where) {
      filtered = filtered.filter(msg => {
        return Object.entries(options.where!).every(([key, value]) => {
          return (msg as any)[key] === value;
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
      // Ordenar por sequenceNumber por defecto
      filtered.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    }

    // Aplicar paginación
    if (options.limit) {
      const offset = options.offset || 0;
      filtered = filtered.slice(offset, offset + options.limit);
    }

    return filtered;
  }

  async findByConversationPaginated(conversationId: string, options: PaginationOptions): Promise<PaginatedResult<Message>> {
    // Aplicar valores por defecto
    const page = options.page || 1;
    const limit = options.limit || 20;
    const sortBy = options.sortBy || 'sequenceNumber';
    const sortOrder = options.sortOrder || 'asc';

    let messages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId);

    // Aplicar búsqueda
    if (options.search) {
      const search = options.search.toLowerCase();
      messages = messages.filter(msg => 
        msg.content.toLowerCase().includes(search)
      );
    }

    const total = messages.length;

    // Aplicar ordenamiento
    const order = sortOrder === 'asc' ? 1 : -1;
    
    messages.sort((a, b) => {
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
    const paginatedData = messages.slice(offset, offset + limit);

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

  async findById(id: string): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async update(id: string, data: UpdateMessageData): Promise<Message> {
    const message = this.messages.get(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    const updatedMessage: Message = {
      ...message,
      ...data,
      updatedAt: new Date()
    };

    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async delete(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    this.messages.delete(id);
  }

  async getNextSequenceNumber(conversationId: string): Promise<number> {
    const conversationMessages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId);

    if (conversationMessages.length === 0) {
      return 1;
    }

    const maxSequence = Math.max(...conversationMessages.map(msg => msg.sequenceNumber));
    return maxSequence + 1;
  }

  async getLastMessage(conversationId: string): Promise<Message | null> {
    const conversationMessages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => b.sequenceNumber - a.sequenceNumber);

    return conversationMessages[0] || null;
  }

  async countByConversation(conversationId: string): Promise<number> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId).length;
  }
}
