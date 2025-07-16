import { Injectable } from '@nestjs/common';
import { ChatResponse } from '../dtos/ollama-response.dto';
import { ChatResponseDto } from '../dtos/ollama-response.dto';

@Injectable()
export class ChatResponseMapper {
  toDto(response: ChatResponse): ChatResponseDto {
    return {
      model: response.model,
      message: response.message,
      createdAt: response.created_at,
      done: response.done,
      totalDuration: response.total_duration,
      loadDuration: response.load_duration,
      promptEvalCount: response.prompt_eval_count,
      promptEvalDuration: response.prompt_eval_duration,
      evalCount: response.eval_count,
      evalDuration: response.eval_duration,
    };
  }

  toEntity(dto: ChatResponseDto): ChatResponse {
    return {
      model: dto.model,
      message: dto.message,
      created_at: dto.createdAt,
      done: dto.done,
      total_duration: dto.totalDuration,
      load_duration: dto.loadDuration,
      prompt_eval_count: dto.promptEvalCount,
      prompt_eval_duration: dto.promptEvalDuration,
      eval_count: dto.evalCount,
      eval_duration: dto.evalDuration,
    };
  }
}
