import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsObject, MaxLength, MinLength, IsNumber, Min, Max } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Title for the conversation',
    example: 'My new chat about TypeScript',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'AI provider to use',
    enum: ['ollama', 'anthropic', 'openai'],
    example: 'ollama'
  })
  @IsString()
  @IsIn(['ollama', 'anthropic', 'openai'])
  aiProvider: 'ollama' | 'anthropic' | 'openai';

  @ApiProperty({
    description: 'AI model to use',
    example: 'llama2'
  })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'System prompt for the conversation',
    example: 'You are a helpful programming assistant.',
    required: false,
    maxLength: 2000
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  systemPrompt?: string;

  @ApiProperty({
    description: 'AI model settings',
    example: {
      temperature: 0.7,
      maxTokens: 1000
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };
}
