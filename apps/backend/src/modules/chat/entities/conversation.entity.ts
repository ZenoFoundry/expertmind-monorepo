import { ApiProperty } from '@nestjs/swagger';

export class Conversation {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: 'conv_123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the conversation',
    example: 'Chat about TypeScript'
  })
  title: string;

  @ApiProperty({
    description: 'User ID who owns this conversation',
    example: 'user_123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'AI provider being used',
    enum: ['agno', 'ollama', 'anthropic', 'openai'],
    example: 'agno'
  })
  aiProvider: 'agno' | 'ollama' | 'anthropic' | 'openai';

  @ApiProperty({
    description: 'AI model being used',
    example: 'llama2'
  })
  model: string;

  @ApiProperty({
    description: 'System prompt for the conversation',
    example: 'You are a helpful programming assistant.',
    required: false
  })
  systemPrompt?: string;

  @ApiProperty({
    description: 'Configuration settings for the AI model',
    example: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9
    }
  })
  settings: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Number of messages in this conversation',
    example: 5
  })
  messageCount: number;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  lastActivity: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether the conversation is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Conversation metadata',
    example: {
      totalTokensUsed: 1500,
      averageResponseTime: 2.5
    },
    required: false
  })
  metadata?: {
    totalTokensUsed?: number;
    averageResponseTime?: number;
    [key: string]: any;
  };
}
