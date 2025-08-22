import { ApiProperty } from '@nestjs/swagger';

export class Message {
  @ApiProperty({
    description: 'Unique identifier for the message',
    example: 'msg_123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Conversation ID this message belongs to',
    example: 'conv_123e4567-e89b-12d3-a456-426614174000'
  })
  conversationId: string;

  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['user', 'assistant', 'system'],
    example: 'user'
  })
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, can you help me with TypeScript?'
  })
  content: string;

  @ApiProperty({
    description: 'Message metadata',
    example: {
      tokensUsed: 25,
      processingTimeMs: 1500,
      model: 'llama2',
      temperature: 0.7
    },
    required: false
  })
  metadata?: {
    tokensUsed?: number;
    processingTimeMs?: number;
    model?: string;
    temperature?: number;
    finishReason?: string;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Message attachments',
    type: [Object],
    example: [
      {
        id: 'att_123',
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024,
        url: 'https://example.com/files/document.pdf'
      }
    ],
    required: false
  })
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    metadata?: Record<string, any>;
  }>;

  @ApiProperty({
    description: 'Message status',
    enum: ['pending', 'sent', 'delivered', 'failed'],
    example: 'sent'
  })
  status: 'pending' | 'sent' | 'delivered' | 'failed';

  @ApiProperty({
    description: 'Error information if message failed',
    example: 'Rate limit exceeded',
    required: false
  })
  error?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Parent message ID for threaded conversations',
    example: 'msg_parent_123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  parentMessageId?: string;

  @ApiProperty({
    description: 'Message sequence number within conversation',
    example: 3
  })
  sequenceNumber: number;
}
