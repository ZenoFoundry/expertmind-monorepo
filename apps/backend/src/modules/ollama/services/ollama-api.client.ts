import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatRequestDto, GenerateRequestDto } from '../dtos/chat-request.dto';
import { ChatResponse, GenerateResponse, ModelInfo } from '../dtos/ollama-response.dto';

export class OllamaApiClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
  ) {}

  async getModels(): Promise<ModelInfo[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/api/tags`),
    );
    return response.data.models || [];
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponse> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/api/chat`, {
        model: chatRequest.model,
        messages: chatRequest.messages,
        stream: false,
        options: chatRequest.options || {},
      }),
    );

    return {
      model: response.data.model,
      message: response.data.message,
      created_at: response.data.created_at,
      done: response.data.done,
      total_duration: response.data.total_duration,
      load_duration: response.data.load_duration,
      prompt_eval_count: response.data.prompt_eval_count,
      prompt_eval_duration: response.data.prompt_eval_duration,
      eval_count: response.data.eval_count,
      eval_duration: response.data.eval_duration,
    };
  }

  async generate(generateRequest: GenerateRequestDto): Promise<GenerateResponse> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/api/generate`, {
        model: generateRequest.model,
        prompt: generateRequest.prompt,
        stream: false,
        options: generateRequest.options || {},
      }),
    );

    return {
      model: response.data.model,
      created_at: response.data.created_at,
      response: response.data.response,
      done: response.data.done,
      context: response.data.context,
      total_duration: response.data.total_duration,
      load_duration: response.data.load_duration,
      prompt_eval_count: response.data.prompt_eval_count,
      prompt_eval_duration: response.data.prompt_eval_duration,
      eval_count: response.data.eval_count,
      eval_duration: response.data.eval_duration,
    };
  }

  async pullModel(modelName: string): Promise<{ status: string }> {
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/api/pull`, {
        name: modelName,
      }),
    );

    return { status: 'success' };
  }

  async checkHealth(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/tags`),
      );
      return true;
    } catch {
      return false;
    }
  }
}
