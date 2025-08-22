// Export main module
export { ChatModule } from './chat.module';

// Export controllers
export { ChatController } from './controller/chat.controller';

// Export services
export { ChatService } from './services/chat.service';
export { ConversationService } from './services/conversation.service';
export { MessageService } from './services/message.service';
export { AIProviderService } from './services/ai-provider.service';

// Export entities
export { Conversation } from './entities/conversation.entity';
export { Message } from './entities/message.entity';

// Export DTOs
export * from './dtos';

// Export interfaces
export * from './interfaces/chat.interface';
export * from './interfaces/ai-provider.interface';

// Export guards
export { ConversationOwnershipGuard } from './guards/conversation-ownership.guard';
