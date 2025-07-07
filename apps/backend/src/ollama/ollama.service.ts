import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ChatRequest, ChatResponse, ModelInfo, GenerateRequest, GenerateResponse } from './dto/ollama.dto';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.logger.log(`Ollama URL configurada: ${this.ollamaUrl}`);
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ollamaUrl}/api/tags`),
      );
      return response.data.models || [];
    } catch (error) {
      this.logger.error('Error obteniendo modelos de Ollama:', error.message);
      throw new Error('No se pudieron obtener los modelos de Ollama');
    }
  }

  async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.log(`Enviando chat request con modelo: ${chatRequest.model}`);
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.ollamaUrl}/api/chat`, {
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
    } catch (error) {
      this.logger.error('Error en chat con Ollama:', error.message);
      if (error.response?.data) {
        this.logger.error('Detalles del error:', error.response.data);
      }
      throw new Error(`Error comunicándose con Ollama: ${error.message}`);
    }
  }

  async generate(generateRequest: GenerateRequest): Promise<GenerateResponse> {
    try {
      this.logger.log(`Generando respuesta con modelo: ${generateRequest.model}`);
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.ollamaUrl}/api/generate`, {
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
    } catch (error) {
      this.logger.error('Error generando respuesta con Ollama:', error.message);
      throw new Error(`Error generando respuesta: ${error.message}`);
    }
  }

  async pullModel(modelName: string): Promise<{ status: string }> {
    try {
      this.logger.log(`Descargando modelo: ${modelName}`);
      
      await firstValueFrom(
        this.httpService.post(`${this.ollamaUrl}/api/pull`, {
          name: modelName,
        }),
      );

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error descargando modelo:', error.message);
      throw new Error(`Error descargando modelo: ${error.message}`);
    }
  }

  async isOllamaReady(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.ollamaUrl}/api/tags`),
      );
      return true;
    } catch (error) {
      this.logger.warn('Ollama no está disponible:', error.message);
      return false;
    }
  }
}
