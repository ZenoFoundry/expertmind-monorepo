import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'conv_123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Conversation title',
    example: 'Chat about TypeScript'
  })
  title: string;

  @ApiProperty({
    description: 'AI provider',
    example: 'ollama'
  })
  aiProvider: string;

  @ApiProperty({
    description: 'AI model',
    example: 'llama2'
  })
  model: string;

  @ApiProperty({
    description: 'System prompt',
    required: false
  })
  systemPrompt?: string;

  @ApiProperty({
    description: 'AI settings'
  })
  settings: Record<string, any>;

  @ApiProperty({
    description: 'Message count',
    example: 5
  })
  messageCount: number;

  @ApiProperty({
    description: 'Last activity',
    example: '2024-01-15T10:30:00Z'
  })
  lastActivity: Date;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-15T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Conversation metadata',
    required: false
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Preview of last message',
    required: false
  })
  lastMessage?: {
    content: string;
    role: string;
    createdAt: Date;
  };
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'msg_123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Conversation ID',
    example: 'conv_123e4567-e89b-12d3-a456-426614174000'
  })
  conversationId: string;

  @ApiProperty({
    description: 'Message role',
    example: 'user'
  })
  role: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, can you help me with TypeScript?'
  })
  content: string;

  @ApiProperty({
    description: 'Message metadata',
    required: false
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Message attachments',
    required: false
  })
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;

  @ApiProperty({
    description: 'Message status',
    example: 'sent'
  })
  status: string;

  @ApiProperty({
    description: 'Error message',
    required: false
  })
  error?: string;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Parent message ID',
    required: false
  })
  parentMessageId?: string;

  @ApiProperty({
    description: 'Sequence number',
    example: 3
  })
  sequenceNumber: number;
}
