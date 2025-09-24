import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ConversationEntity, ConversationDocument } from '../schemas/conversation.schema';
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
  
  constructor(
    @InjectModel(ConversationEntity.name) 
    private conversationModel: Model<ConversationDocument>
  ) {}

  async create(data: CreateConversationData & { userId: string }): Promise<Conversation> {
    const id = `conv_${uuidv4()}`;
    
    const conversationData = {
      id,
      title: data.title,
      userId: data.userId,
      aiProvider: data.aiProvider,
      model: data.model,
      systemPrompt: data.systemPrompt,
      settings: data.settings || {},
      messageCount: 0,
      lastActivity: new Date(),
      isActive: true,
      metadata: {}
    };

    const createdConversation = new this.conversationModel(conversationData);
    const savedConversation = await createdConversation.save();
    
    return this.toConversationEntity(savedConversation);
  }

  async findByUser(userId: string, options: FindOptions = {}): Promise<Conversation[]> {
    const query = this.conversationModel.find({ userId, isActive: true });

    // Aplicar filtros adicionales
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query.where(key).equals(value);
      });
    }

    // Aplicar ordenamiento
    if (options.orderBy) {
      const sortOrder = options.order === 'ASC' ? 1 : -1;
      query.sort({ [options.orderBy]: sortOrder });
    } else {
      // Ordenar por lastActivity por defecto
      query.sort({ lastActivity: -1 });
    }

    // Aplicar paginación
    if (options.offset) {
      query.skip(options.offset);
    }
    if (options.limit) {
      query.limit(options.limit);
    }

    const conversations = await query.exec();
    return conversations.map(conv => this.toConversationEntity(conv));
  }

  async findByUserPaginated(userId: string, options: PaginationOptions): Promise<PaginatedResult<Conversation>> {
    // Aplicar valores por defecto
    const page = options.page || 1;
    const limit = options.limit || 20;
    const sortBy = options.sortBy || 'lastActivity';
    const sortOrder = options.sortOrder || 'desc';

    // Construir query base
    const baseQuery = { userId, isActive: true };
    let query = this.conversationModel.find(baseQuery);

    // Aplicar búsqueda
    if (options.search) {
      const search = options.search;
      query = this.conversationModel.find({
        ...baseQuery,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Contar total
    const total = await this.conversationModel.countDocuments(query.getQuery()).exec();

    // Aplicar ordenamiento
    const sortOrder_num = sortOrder === 'asc' ? 1 : -1;
    query.sort({ [sortBy]: sortOrder_num });

    // Aplicar paginación
    const offset = (page - 1) * limit;
    query.skip(offset).limit(limit);

    const conversations = await query.exec();

    return {
      data: conversations.map(conv => this.toConversationEntity(conv)),
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
    const conversation = await this.conversationModel.findOne({ id, isActive: true }).exec();
    return conversation ? this.toConversationEntity(conversation) : null;
  }

  async update(id: string, data: UpdateConversationData): Promise<Conversation> {
    const updatedConversation = await this.conversationModel.findOneAndUpdate(
      { id, isActive: true },
      { ...data, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updatedConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return this.toConversationEntity(updatedConversation);
  }

  async delete(id: string): Promise<void> {
    const result = await this.conversationModel.findOneAndUpdate(
      { id, isActive: true },
      { isActive: false, updatedAt: new Date() }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
  }

  async incrementMessageCount(id: string): Promise<void> {
    const result = await this.conversationModel.findOneAndUpdate(
      { id, isActive: true },
      { 
        $inc: { messageCount: 1 },
        updatedAt: new Date()
      }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
  }

  async updateLastActivity(id: string): Promise<void> {
    const now = new Date();
    const result = await this.conversationModel.findOneAndUpdate(
      { id, isActive: true },
      { 
        lastActivity: now,
        updatedAt: now
      }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
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

  // Helper method to convert Mongoose document to Conversation entity
  private toConversationEntity(doc: ConversationDocument): Conversation {
    return {
      id: doc.id,
      title: doc.title,
      userId: doc.userId,
      aiProvider: doc.aiProvider,
      model: doc.model,
      systemPrompt: doc.systemPrompt,
      settings: doc.settings,
      messageCount: doc.messageCount,
      lastActivity: doc.lastActivity,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      isActive: doc.isActive,
      metadata: doc.metadata
    };
  }
}
