import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { AIProviderService } from './ai-provider.service';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import {
  IChatService,
  CreateConversationData,
  UpdateConversationData,
  SendMessageData,
  PaginationOptions,
  PaginatedResult
} from '../interfaces/chat.interface';

@Injectable()
export class ChatService implements IChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly aiProviderService: AIProviderService
  ) {}

  // ===============================
  // GESTIÓN DE CONVERSACIONES
  // ===============================

  async createConversation(userId: string, data: CreateConversationData): Promise<Conversation> {
    this.logger.log(`Creating conversation for user ${userId}: ${data.title}`);

    // Validar que el proveedor y modelo existen
    await this.validateProviderAndModel(data.aiProvider, data.model);

    // Validar configuraciones si se proporcionan
    if (data.settings) {
      const validation = await this.aiProviderService.validateSettings(data.aiProvider, data.settings);
      if (!validation.isValid) {
        throw new BadRequestException(`Invalid settings: ${validation.errors.join(', ')}`);
      }
    }

    const conversation = await this.conversationService.create({
      ...data,
      userId
    });

    this.logger.log(`Created conversation ${conversation.id} for user ${userId}`);
    return conversation;
  }

  async getUserConversations(userId: string, pagination: PaginationOptions): Promise<PaginatedResult<Conversation>> {
    this.logger.log(`Getting conversations for user ${userId}, page ${pagination.page}`);

    const result = await this.conversationService.findByUserPaginated(userId, pagination);
    
    // Enriquecer con información del último mensaje
    for (const conversation of result.data) {
      const lastMessage = await this.messageService.getLastMessage(conversation.id);
      if (lastMessage) {
        (conversation as any).lastMessage = {
          content: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
          role: lastMessage.role,
          createdAt: lastMessage.createdAt
        };
      }
    }

    return result;
  }

  async getConversation(conversationId: string, userId: string): Promise<Conversation> {
    this.logger.log(`Getting conversation ${conversationId} for user ${userId}`);

    const conversation = await this.conversationService.validateOwnership(conversationId, userId);
    return conversation;
  }

  async updateConversation(conversationId: string, userId: string, data: UpdateConversationData): Promise<Conversation> {
    this.logger.log(`Updating conversation ${conversationId} for user ${userId}`);

    // Validar propiedad
    await this.conversationService.validateOwnership(conversationId, userId);

    // Validar nuevo proveedor y modelo si se están cambiando
    if (data.aiProvider && data.model) {
      await this.validateProviderAndModel(data.aiProvider, data.model);
    }

    // Validar nuevas configuraciones si se proporcionan
    if (data.settings && data.aiProvider) {
      const validation = await this.aiProviderService.validateSettings(data.aiProvider, data.settings);
      if (!validation.isValid) {
        throw new BadRequestException(`Invalid settings: ${validation.errors.join(', ')}`);
      }
    }

    const updatedConversation = await this.conversationService.update(conversationId, data);
    this.logger.log(`Updated conversation ${conversationId}`);

    return updatedConversation;
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting conversation ${conversationId} for user ${userId}`);

    // Validar propiedad
    await this.conversationService.validateOwnership(conversationId, userId);

    // Eliminar todos los mensajes de la conversación
    const messages = await this.messageService.findByConversation(conversationId);
    for (const message of messages) {
      await this.messageService.delete(message.id);
    }

    // Eliminar la conversación
    await this.conversationService.delete(conversationId);

    this.logger.log(`Deleted conversation ${conversationId} and ${messages.length} messages`);
  }

  // ===============================
  // GESTIÓN DE MENSAJES
  // ===============================

  async sendMessage(conversationId: string, userId: string, data: SendMessageData): Promise<Message> {
    this.logger.log(`Sending message to conversation ${conversationId} from user ${userId}`);

    // Validar que la conversación existe y pertenece al usuario
    const conversation = await this.conversationService.validateOwnership(conversationId, userId);

    if (!conversation.isActive) {
      throw new BadRequestException('Cannot send messages to inactive conversation');
    }

    // Crear el mensaje del usuario
    const userMessage = await this.messageService.create({
      conversationId,
      role: 'user',
      content: data.content,
      parentMessageId: data.parentMessageId,
      attachments: data.attachments ? await this.processAttachments(data.attachments) : undefined,
      status: 'sent'
    });

    // Actualizar contador de mensajes y última actividad
    await this.conversationService.incrementMessageCount(conversationId);
    await this.conversationService.updateLastActivity(conversationId);

    this.logger.log(`Created user message ${userMessage.id}`);

    // Obtener historial de mensajes para contexto
    const messageHistory = await this.messageService.findByConversation(conversationId, {
      orderBy: 'sequenceNumber',
      order: 'ASC'
    });

    // Preparar configuraciones para la IA
    const aiSettings = {
      ...conversation.settings,
      ...data.overrideSettings
    };

    // Preparar mensajes para la IA
    const aiMessages = this.prepareMessagesForAI(messageHistory, conversation.systemPrompt);

    try {
      // Crear mensaje asistente en estado pending
      const assistantMessage = await this.messageService.create({
        conversationId,
        role: 'assistant',
        content: '',
        status: 'pending',
        metadata: {
          model: conversation.model,
          settings: aiSettings
        }
      });

      // Enviar a la IA
      const aiResponse = await this.aiProviderService.sendMessage(conversation.aiProvider, {
        model: conversation.model,
        messages: aiMessages,
        settings: aiSettings,
        conversationId,
        userId
      });

      // Actualizar el mensaje del asistente con la respuesta
      const updatedAssistantMessage = await this.messageService.update(assistantMessage.id, {
        content: aiResponse.content || 'Lo siento, no pude generar una respuesta.',
        status: aiResponse.error ? 'failed' : 'sent',
        error: aiResponse.error,
        metadata: {
          ...assistantMessage.metadata,
          ...aiResponse.metadata
        }
      });

      // Actualizar última actividad
      await this.conversationService.updateLastActivity(conversationId);
      await this.conversationService.incrementMessageCount(conversationId);

      this.logger.log(`Created assistant message ${updatedAssistantMessage.id}`);

      return userMessage; // Retornamos el mensaje del usuario, el del asistente se maneja por separado

    } catch (error) {
      this.logger.error(`Error getting AI response for conversation ${conversationId}:`, error);
      
      // En lugar de crear un nuevo mensaje, intentamos actualizar el mensaje pending si existe
      const pendingMessages = await this.messageService.findByConversation(conversationId);
      const lastPendingMessage = pendingMessages
        .filter(m => m.role === 'assistant' && m.status === 'pending')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      if (lastPendingMessage) {
        // Actualizar el mensaje pendiente con el error
        await this.messageService.update(lastPendingMessage.id, {
          content: this.getErrorMessage(error),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            ...lastPendingMessage.metadata,
            errorType: 'ai_provider_error',
            errorDetails: error instanceof Error ? error.stack : undefined
          }
        });
      } else {
        // Solo si no hay mensaje pendiente, crear uno nuevo
        await this.messageService.create({
          conversationId,
          role: 'assistant',
          content: this.getErrorMessage(error),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            model: conversation.model,
            errorType: 'ai_provider_error'
          }
        });
      }

      await this.conversationService.incrementMessageCount(conversationId);
      throw error;
    }
  }

  async getMessages(conversationId: string, userId: string, pagination: PaginationOptions): Promise<PaginatedResult<Message>> {
    this.logger.log(`Getting messages for conversation ${conversationId}, user ${userId}, page ${pagination.page}`);

    // Validar que la conversación existe y pertenece al usuario
    await this.conversationService.validateOwnership(conversationId, userId);

    const result = await this.messageService.findByConversationPaginated(conversationId, pagination);
    return result;
  }

  // ===============================
  // MÉTODOS AUXILIARES
  // ===============================

  private async validateProviderAndModel(provider: string, model: string): Promise<void> {
    // Verificar que el proveedor existe
    const availableProviders = this.aiProviderService.getAvailableProviders();
    if (!availableProviders.includes(provider)) {
      throw new BadRequestException(`AI provider '${provider}' is not available`);
    }

    // Verificar que el modelo existe para ese proveedor
    try {
      const models = await this.aiProviderService.getModels(provider);
      const modelExists = models.some(m => m.name === model);
      
      if (!modelExists) {
        throw new BadRequestException(`Model '${model}' is not available for provider '${provider}'`);
      }
    } catch (error) {
      this.logger.warn(`Could not validate model ${model} for provider ${provider}:`, error);
      // No lanzamos error aquí para permitir modelos que no estén en la lista pero que funcionen
    }
  }

  private prepareMessagesForAI(messages: Message[], systemPrompt?: string): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
    const aiMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

    // Agregar system prompt si existe
    if (systemPrompt) {
      aiMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Agregar mensajes de la conversación
    for (const message of messages) {
      if (message.role !== 'system' && message.status === 'sent') {
        aiMessages.push({
          role: message.role as 'user' | 'assistant',
          content: message.content
        });
      }
    }

    return aiMessages;
  }

  private async processAttachments(attachments: Array<{ name: string; type: string; size: number; data: string }>): Promise<Array<{ id: string; name: string; type: string; size: number; url: string }>> {
    // En una implementación real, aquí se subirían los archivos a un servicio de almacenamiento
    // Por ahora, simularemos el procesamiento
    
    return attachments.map(att => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2)}`,
      name: att.name,
      type: att.type,
      size: att.size,
      url: `https://storage.example.com/attachments/${att.name}` // URL simulada
    }));
  }

  private getErrorMessage(error: any): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Detectar tipos específicos de errores para dar mensajes más útiles
    if (errorMessage.includes('Ollama') || errorMessage.includes('11434')) {
      return '🤖 La IA no está disponible en este momento. Asegúrate de que Ollama esté ejecutándose.';
    }
    
    if (errorMessage.includes('Connection refused') || errorMessage.includes('ECONNREFUSED')) {
      return '🔌 No se puede conectar con el servicio de IA. Verifica que esté ejecutándose.';
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      return '⏱️ La IA tardó demasiado en responder. Inténtalo de nuevo.';
    }
    
    if (errorMessage.includes('model') && errorMessage.includes('not found')) {
      return '🤖 El modelo de IA solicitado no está disponible.';
    }
    
    // Mensaje genérico para otros errores
    return '❌ Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.';
  }

  // ===============================
  // MÉTODOS ADICIONALES
  // ===============================

  async getConversationStats(conversationId: string, userId: string): Promise<{
    messageCount: number;
    tokensUsed: number;
    averageResponseTime: number;
    lastActivity: Date;
  }> {
    // Validar propiedad
    const conversation = await this.conversationService.validateOwnership(conversationId, userId);
    
    const messages = await this.messageService.findByConversation(conversationId);
    
    let tokensUsed = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    for (const message of messages) {
      if (message.metadata?.tokensUsed) {
        tokensUsed += message.metadata.tokensUsed;
      }
      
      if (message.role === 'assistant' && message.metadata?.processingTimeMs) {
        totalResponseTime += message.metadata.processingTimeMs;
        responseCount++;
      }
    }

    return {
      messageCount: conversation.messageCount,
      tokensUsed,
      averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      lastActivity: conversation.lastActivity
    };
  }

  async searchMessages(conversationId: string, userId: string, query: string): Promise<Message[]> {
    // Validar propiedad
    await this.conversationService.validateOwnership(conversationId, userId);
    
    const messages = await this.messageService.findByConversation(conversationId);
    
    return messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAvailableProviders(): Promise<Array<{ name: string; models: string[]; isHealthy: boolean }>> {
    const providers = this.aiProviderService.getAvailableProviders();
    
    const result = await Promise.all(
      providers.map(async (name) => {
        try {
          const models = await this.aiProviderService.getModels(name);
          const isHealthy = await this.aiProviderService.checkProviderHealth(name);
          
          return {
            name,
            models: models.map(m => m.name),
            isHealthy
          };
        } catch (error) {
          return {
            name,
            models: [],
            isHealthy: false
          };
        }
      })
    );

    return result;
  }
}
