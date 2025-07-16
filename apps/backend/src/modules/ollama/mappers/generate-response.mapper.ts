import { Injectable } from '@nestjs/common';
import { GenerateResponse } from '../dtos/ollama-response.dto';
import { GenerateResponseDto } from '../dtos/ollama-response.dto';

@Injectable()
export class GenerateResponseMapper {
  toDto(response: GenerateResponse): GenerateResponseDto {
    return {
      model: response.model,
      createdAt: response.created_at,
      response: response.response,
      done: response.done,
      context: response.context,
      totalDuration: response.total_duration,
      loadDuration: response.load_duration,
      promptEvalCount: response.prompt_eval_count,
      promptEvalDuration: response.prompt_eval_duration,
      evalCount: response.eval_count,
      evalDuration: response.eval_duration,
    };
  }

  toEntity(dto: GenerateResponseDto): GenerateResponse {
    return {
      model: dto.model,
      created_at: dto.createdAt,
      response: dto.response,
      done: dto.done,
      context: dto.context,
      total_duration: dto.totalDuration,
      load_duration: dto.loadDuration,
      prompt_eval_count: dto.promptEvalCount,
      prompt_eval_duration: dto.promptEvalDuration,
      eval_count: dto.evalCount,
      eval_duration: dto.evalDuration,
    };
  }
}
