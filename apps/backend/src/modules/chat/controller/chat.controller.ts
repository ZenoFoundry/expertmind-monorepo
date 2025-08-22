import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatService } from '../services/chat.service';
import {
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  ConversationResponseDto,
  MessageResponseDto,
  PaginationDto,
  PaginatedResponseDto
} from '../dtos';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  // ===============================
  // ENDPOINTS DE CONVERSACIONES
  // ===============================

  @Post('conversations')
  @ApiOperation({ 
    summary: 'Crear una nueva conversación',
    description: 'Crea una nueva conversación de chat para el usuario autenticado'
  })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Conversación creada exitosamente',
    type: ConversationResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  async createConversation(
    @Request() req: any,
    @Body(ValidationPipe) createConversationDto: CreateConversationDto
  ): Promise<ConversationResponseDto> {
    try {
      const userId = req.user.id;
      const conversation = await this.chatService.createConversation(userId, createConversationDto);
      
      return this.mapConversationToDto(conversation);
    } catch (error) {
      this.logger.error('Error creating conversation:', error);
      throw new HttpException(
        error.message || 'Failed to create conversation',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('conversations')
  @ApiOperation({ 
    summary: 'Listar conversaciones del usuario',
    description: 'Obtiene una lista paginada de conversaciones del usuario autenticado'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Orden de clasificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de conversaciones obtenida exitosamente',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  async getConversations(
    @Request() req: any,
    @Query(ValidationPipe) paginationDto: PaginationDto
  ): Promise<PaginatedResponseDto<ConversationResponseDto>> {
    try {
      const userId = req.user.id;
      const result = await this.chatService.getUserConversations(userId, paginationDto);
      
      return {
        data: result.data.map(conv => this.mapConversationToDto(conv)),
        pagination: result.pagination
      };
    } catch (error) {
      this.logger.error('Error getting conversations:', error);
      throw new HttpException(
        error.message || 'Failed to get conversations',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('conversations/:id')
  @ApiOperation({ 
    summary: 'Obtener una conversación específica',
    description: 'Obtiene los detalles de una conversación específica del usuario'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversación obtenida exitosamente',
    type: ConversationResponseDto
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async getConversation(
    @Request() req: any,
    @Param('id') conversationId: string
  ): Promise<ConversationResponseDto> {
    try {
      const userId = req.user.id;
      const conversation = await this.chatService.getConversation(conversationId, userId);
      
      return this.mapConversationToDto(conversation);
    } catch (error) {
      this.logger.error(`Error getting conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to get conversation',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('conversations/:id')
  @ApiOperation({ 
    summary: 'Actualizar una conversación',
    description: 'Actualiza los detalles de una conversación existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiBody({ type: UpdateConversationDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversación actualizada exitosamente',
    type: ConversationResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async updateConversation(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body(ValidationPipe) updateConversationDto: UpdateConversationDto
  ): Promise<ConversationResponseDto> {
    try {
      const userId = req.user.id;
      const conversation = await this.chatService.updateConversation(conversationId, userId, updateConversationDto);
      
      return this.mapConversationToDto(conversation);
    } catch (error) {
      this.logger.error(`Error updating conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to update conversation',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('conversations/:id')
  @ApiOperation({ 
    summary: 'Eliminar una conversación',
    description: 'Elimina una conversación y todos sus mensajes asociados'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiResponse({ status: 204, description: 'Conversación eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async deleteConversation(
    @Request() req: any,
    @Param('id') conversationId: string
  ): Promise<void> {
    try {
      const userId = req.user.id;
      await this.chatService.deleteConversation(conversationId, userId);
    } catch (error) {
      this.logger.error(`Error deleting conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to delete conversation',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===============================
  // ENDPOINTS DE MENSAJES
  // ===============================

  @Post('conversations/:id/messages')
  @ApiOperation({ 
    summary: 'Enviar un mensaje',
    description: 'Envía un mensaje a una conversación y obtiene la respuesta de la IA'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Mensaje enviado exitosamente',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async sendMessage(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body(ValidationPipe) sendMessageDto: SendMessageDto
  ): Promise<MessageResponseDto> {
    try {
      const userId = req.user.id;
      const message = await this.chatService.sendMessage(conversationId, userId, sendMessageDto);
      
      return this.mapMessageToDto(message);
    } catch (error) {
      this.logger.error(`Error sending message to conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to send message',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ 
    summary: 'Obtener mensajes de una conversación',
    description: 'Obtiene una lista paginada de mensajes de una conversación específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda en el contenido' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Orden de clasificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensajes obtenidos exitosamente',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async getMessages(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Query(ValidationPipe) paginationDto: PaginationDto
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    try {
      const userId = req.user.id;
      const result = await this.chatService.getMessages(conversationId, userId, paginationDto);
      
      return {
        data: result.data.map(msg => this.mapMessageToDto(msg)),
        pagination: result.pagination
      };
    } catch (error) {
      this.logger.error(`Error getting messages from conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to get messages',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===============================
  // ENDPOINTS ADICIONALES
  // ===============================

  @Get('conversations/:id/stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de una conversación',
    description: 'Obtiene estadísticas detalladas de una conversación (tokens usados, tiempo promedio, etc.)'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        messageCount: { type: 'number', description: 'Número total de mensajes' },
        tokensUsed: { type: 'number', description: 'Tokens totales utilizados' },
        averageResponseTime: { type: 'number', description: 'Tiempo promedio de respuesta en ms' },
        lastActivity: { type: 'string', format: 'date-time', description: 'Última actividad' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async getConversationStats(
    @Request() req: any,
    @Param('id') conversationId: string
  ) {
    try {
      const userId = req.user.id;
      const stats = await this.chatService.getConversationStats(conversationId, userId);
      
      return stats;
    } catch (error) {
      this.logger.error(`Error getting stats for conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to get conversation stats',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('conversations/:id/search')
  @ApiOperation({ 
    summary: 'Buscar mensajes en una conversación',
    description: 'Busca mensajes que contengan un término específico dentro de una conversación'
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación' })
  @ApiQuery({ name: 'q', type: String, description: 'Término de búsqueda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Búsqueda completada exitosamente',
    type: [MessageResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Parámetro de búsqueda requerido' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la conversación' })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async searchMessages(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Query('q') query: string
  ): Promise<MessageResponseDto[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }

      const userId = req.user.id;
      const messages = await this.chatService.searchMessages(conversationId, userId, query);
      
      return messages.map(msg => this.mapMessageToDto(msg));
    } catch (error) {
      this.logger.error(`Error searching messages in conversation ${conversationId}:`, error);
      throw new HttpException(
        error.message || 'Failed to search messages',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('providers')
  @ApiOperation({ 
    summary: 'Obtener proveedores de IA disponibles',
    description: 'Lista todos los proveedores de IA disponibles y sus modelos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Proveedores obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre del proveedor' },
          models: { type: 'array', items: { type: 'string' }, description: 'Modelos disponibles' },
          isHealthy: { type: 'boolean', description: 'Estado de salud del proveedor' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  async getProviders(@Request() req: any) {
    try {
      const providers = await this.chatService.getAvailableProviders();
      return providers;
    } catch (error) {
      this.logger.error('Error getting AI providers:', error);
      throw new HttpException(
        error.message || 'Failed to get AI providers',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===============================
  // MÉTODOS DE MAPEO
  // ===============================

  private mapConversationToDto(conversation: any): ConversationResponseDto {
    return {
      id: conversation.id,
      title: conversation.title,
      aiProvider: conversation.aiProvider,
      model: conversation.model,
      systemPrompt: conversation.systemPrompt,
      settings: conversation.settings,
      messageCount: conversation.messageCount,
      lastActivity: conversation.lastActivity,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      isActive: conversation.isActive,
      metadata: conversation.metadata,
      lastMessage: conversation.lastMessage
    };
  }

  private mapMessageToDto(message: any): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      attachments: message.attachments,
      status: message.status,
      error: message.error,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      parentMessageId: message.parentMessageId,
      sequenceNumber: message.sequenceNumber
    };
  }
}
