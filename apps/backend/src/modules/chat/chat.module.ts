import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { ConversationEntity, ConversationSchema } from './schemas/conversation.schema';

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
import { AgnoModule } from '../agno/agno.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: ConversationEntity.name, schema: ConversationSchema }
    ]),
    AgnoModule,  
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
