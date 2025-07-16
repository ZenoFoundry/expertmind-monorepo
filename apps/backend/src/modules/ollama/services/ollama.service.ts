import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ChatRequestDto, GenerateRequestDto } from '../dtos/chat-request.dto';
import { ChatResponse, GenerateResponse, ModelInfo } from '../dtos/ollama-response.dto';
import { OllamaApiClient } from './ollama-api.client';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaApiClient: OllamaApiClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const ollamaUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.ollamaApiClient = new OllamaApiClient(httpService, ollamaUrl);
    this.logger.log(`Ollama URL configurada: ${ollamaUrl}`);
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      return await this.ollamaApiClient.getModels();
    } catch (error) {
      this.logger.error('Error obteniendo modelos de Ollama:', error.message);
      throw new Error('No se pudieron obtener los modelos de Ollama');
    }
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponse> {
    try {
      this.logger.log(`Enviando chat request con modelo: ${chatRequest.model}`);
      return await this.ollamaApiClient.chat(chatRequest);
    } catch (error) {
      this.logger.error('Error en chat con Ollama:', error.message);
      if (error.response?.data) {
        this.logger.error('Detalles del error:', error.response.data);
      }
      throw new Error(`Error comunicándose con Ollama: ${error.message}`);
    }
  }

  async generate(generateRequest: GenerateRequestDto): Promise<GenerateResponse> {
    try {
      this.logger.log(`Generando respuesta con modelo: ${generateRequest.model}`);
      return await this.ollamaApiClient.generate(generateRequest);
    } catch (error) {
      this.logger.error('Error generando respuesta con Ollama:', error.message);
      throw new Error(`Error generando respuesta: ${error.message}`);
    }
  }

  async pullModel(modelName: string): Promise<{ status: string }> {
    try {
      this.logger.log(`Descargando modelo: ${modelName}`);
      return await this.ollamaApiClient.pullModel(modelName);
    } catch (error) {
      this.logger.error('Error descargando modelo:', error.message);
      throw new Error(`Error descargando modelo: ${error.message}`);
    }
  }

  async isOllamaReady(): Promise<boolean> {
    try {
      return await this.ollamaApiClient.checkHealth();
    } catch (error) {
      this.logger.warn('Ollama no está disponible:', error.message);
      return false;
    }
  }
}
