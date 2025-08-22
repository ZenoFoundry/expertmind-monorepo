import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { ChatController } from './controller/chat.controller';

// Services
import { ChatService } from './services/chat.service';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { AIProviderService } from './services/ai-provider.service';

// Guards
import { ConversationOwnershipGuard } from './guards/conversation-ownership.guard';

// External modules
import { OllamaModule } from '../ollama/ollama.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    OllamaModule, // Para reutilizar el servicio de Ollama existente
    AuthModule   // Para los guards de autenticación
  ],
  controllers: [
    ChatController
  ],
  providers: [
    ChatService,
    ConversationService,
    MessageService,
    AIProviderService,
    ConversationOwnershipGuard
  ],
  exports: [
    ChatService,
    ConversationService,
    MessageService,
    AIProviderService
  ]
})
export class ChatModule {}
