import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum AgnoModel {
  GPT_4_1 = 'gpt-4.1',
  O4_MINI = 'o4-mini'
}

export class AgnoRunRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  stream?: boolean = false;

  @IsOptional()
  @IsEnum(AgnoModel)
  model?: AgnoModel = AgnoModel.GPT_4_1;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  session_id?: string;
}

export class AgnoKnowledgeLoadRequestDto {
  // No hay parámetros adicionales por ahora
  // El agentId se pasa en la URL
}
