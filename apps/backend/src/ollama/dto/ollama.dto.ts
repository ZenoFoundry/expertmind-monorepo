import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Message {
  @ApiProperty({ 
    description: 'Rol del mensaje', 
    enum: ['system', 'user', 'assistant'],
    example: 'user'
  })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ 
    description: 'Contenido del mensaje',
    example: 'Hola, ¿cómo estás?'
  })
  @IsString()
  content: string;
}

export class OllamaOptions {
  @ApiPropertyOptional({ 
    description: 'Número de tokens de contexto',
    example: 2048
  })
  @IsOptional()
  num_ctx?: number;

  @ApiPropertyOptional({ 
    description: 'Temperatura para la generación',
    example: 0.7
  })
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ 
    description: 'Top-p para la generación',
    example: 0.9
  })
  @IsOptional()
  top_p?: number;

  @ApiPropertyOptional({ 
    description: 'Top-k para la generación',
    example: 40
  })
  @IsOptional()
  top_k?: number;
}

export class ChatRequest {
  @ApiProperty({ 
    description: 'Nombre del modelo a usar',
    example: 'tinyllama'
  })
  @IsString()
  model: string;

  @ApiProperty({ 
    description: 'Array de mensajes de la conversación',
    type: [Message]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];

  @ApiPropertyOptional({ 
    description: 'Opciones adicionales para la generación',
    type: OllamaOptions
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OllamaOptions)
  options?: OllamaOptions;
}

export class GenerateRequest {
  @ApiProperty({ 
    description: 'Nombre del modelo a usar',
    example: 'tinyllama'
  })
  @IsString()
  model: string;

  @ApiProperty({ 
    description: 'Prompt para generar la respuesta',
    example: 'Explica qué es la inteligencia artificial'
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ 
    description: 'Opciones adicionales para la generación',
    type: OllamaOptions
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OllamaOptions)
  options?: OllamaOptions;
}

export interface ChatResponse {
  model: string;
  message: Message;
  created_at: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface GenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface ModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}
