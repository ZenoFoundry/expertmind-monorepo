import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @ApiProperty({ 
    description: 'Rol del mensaje', 
    enum: ['system', 'user', 'assistant'],
    example: 'user'
  })
  @IsString()
  @IsNotEmpty()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ 
    description: 'Contenido del mensaje',
    example: 'Hola, ¿cómo estás?'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class OllamaOptionsDto {
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

export class ChatRequestDto {
  @ApiProperty({ 
    description: 'Nombre del modelo a usar',
    example: 'tinyllama'
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ 
    description: 'Array de mensajes de la conversación',
    type: [MessageDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  @IsNotEmpty()
  messages: MessageDto[];

  @ApiPropertyOptional({ 
    description: 'Opciones adicionales para la generación',
    type: OllamaOptionsDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OllamaOptionsDto)
  options?: OllamaOptionsDto;
}

export class GenerateRequestDto {
  @ApiProperty({ 
    description: 'Nombre del modelo a usar',
    example: 'tinyllama'
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ 
    description: 'Prompt para generar la respuesta',
    example: 'Explica qué es la inteligencia artificial'
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiPropertyOptional({ 
    description: 'Opciones adicionales para la generación',
    type: OllamaOptionsDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OllamaOptionsDto)
  options?: OllamaOptionsDto;
}
