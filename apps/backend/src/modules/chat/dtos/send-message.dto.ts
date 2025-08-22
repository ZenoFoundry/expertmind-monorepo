import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, MaxLength, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
  @ApiProperty({
    description: 'Attachment file name',
    example: 'document.pdf'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024
  })
  @IsString()
  size: number;

  @ApiProperty({
    description: 'Base64 encoded file data',
    example: 'JVBERi0xLjQKJcfs...'
  })
  @IsString()
  data: string;
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, can you help me with TypeScript?',
    minLength: 1,
    maxLength: 10000
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @ApiProperty({
    description: 'Parent message ID for threaded conversations',
    example: 'msg_parent_123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsString()
  parentMessageId?: string;

  @ApiProperty({
    description: 'Message attachments',
    type: [AttachmentDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiProperty({
    description: 'Override conversation settings for this message',
    example: {
      temperature: 0.9
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  overrideSettings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };
}
