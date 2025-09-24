import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = ConversationEntity & Document;

@Schema({ 
  collection: 'conversations',
  timestamps: true // Esto crea automáticamente createdAt y updatedAt
})
export class ConversationEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ 
    required: true,
    enum: ['agno', 'ollama', 'anthropic', 'openai']
  })
  aiProvider: 'agno' | 'ollama' | 'anthropic' | 'openai';

  @Prop({ required: true })
  model: string;

  @Prop()
  systemPrompt?: string;

  @Prop({ 
    type: Object,
    default: {}
  })
  settings: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    type: Object,
    default: {}
  })
  metadata?: {
    totalTokensUsed?: number;
    averageResponseTime?: number;
    [key: string]: any;
  };

  // Timestamps automáticos de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(ConversationEntity);

// Índices para mejorar rendimiento
ConversationSchema.index({ userId: 1, lastActivity: -1 });
ConversationSchema.index({ userId: 1, isActive: 1 });
