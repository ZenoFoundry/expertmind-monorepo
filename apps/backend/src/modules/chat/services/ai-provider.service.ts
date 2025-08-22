import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IAIProvider, AIMessageRequest, AIMessageResponse, AIModel, ValidationResult } from '../interfaces/ai-provider.interface';
import { OllamaService } from '../../ollama/services/ollama.service';

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private providers: Map<string, IAIProvider> = new Map();

  constructor(
    private readonly ollamaService: OllamaService
  ) {
    // Registrar proveedores disponibles
    this.registerProvider(new OllamaAIProvider(ollamaService));
  }

  registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered AI provider: ${provider.name}`);
  }

  getProvider(name: string): IAIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new BadRequestException(`AI provider '${name}' not found`);
    }
    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async sendMessage(providerName: string, request: AIMessageRequest): Promise<AIMessageResponse> {
    const provider = this.getProvider(providerName);
    
    try {
      const startTime = Date.now();
      const response = await provider.sendMessage(request);
      const processingTime = Date.now() - startTime;

      return {
        ...response,
        metadata: {
          ...response.metadata,
          processingTimeMs: processingTime,
          provider: providerName
        }
      };
    } catch (error) {
      this.logger.error(`Error sending message to ${providerName}:`, error);
      throw error;
    }
  }

  async getModels(providerName: string): Promise<AIModel[]> {
    const provider = this.getProvider(providerName);
    return provider.getAvailableModels();
  }

  async validateSettings(providerName: string, settings: Record<string, any>): Promise<ValidationResult> {
    const provider = this.getProvider(providerName);
    return provider.validateSettings(settings);
  }

  async checkProviderHealth(providerName: string): Promise<boolean> {
    try {
      const provider = this.getProvider(providerName);
      return await provider.isHealthy();
    } catch (error) {
      this.logger.warn(`Health check failed for provider ${providerName}:`, error);
      return false;
    }
  }
}

// ===============================
// ollama-ai-provider.ts
// ===============================
class OllamaAIProvider implements IAIProvider {
  readonly name = 'ollama';
  readonly supportedModels: string[] = []; // Se cargará dinámicamente

  constructor(private readonly ollamaService: OllamaService) {}

  async sendMessage(request: AIMessageRequest): Promise<AIMessageResponse> {
    try {
      const ollamaRequest = {
        model: request.model,
        messages: request.messages,
        options: request.settings
      };

      const response = await this.ollamaService.chat(ollamaRequest);
      
      return {
        content: response.message?.content || '',
        metadata: {
          model: request.model,
          tokensUsed: (response.prompt_eval_count || 0) + (response.eval_count || 0),
          processingTimeMs: 0, // Se calculará en AIProviderService
          finishReason: response.done ? 'stop' : 'incomplete'
        }
      };
    } catch (error) {
      return {
        content: '',
        metadata: {
          model: request.model,
          processingTimeMs: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const models = await this.ollamaService.getModels();
      return models.map(model => ({
        name: model.name,
        displayName: model.name,
        description: `Ollama model: ${model.name}`,
        maxTokens: 4096, // valor por defecto
        supportedFeatures: ['chat', 'completion'],
        metadata: {
          size: model.size,
          modified_at: model.modified_at
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get Ollama models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateSettings(settings: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (settings.temperature !== undefined) {
      if (typeof settings.temperature !== 'number' || settings.temperature < 0 || settings.temperature > 2) {
        errors.push('Temperature must be a number between 0 and 2');
      }
    }

    if (settings.maxTokens !== undefined) {
      if (typeof settings.maxTokens !== 'number' || settings.maxTokens <= 0) {
        errors.push('maxTokens must be a positive number');
      }
    }

    if (settings.topP !== undefined) {
      if (typeof settings.topP !== 'number' || settings.topP < 0 || settings.topP > 1) {
        errors.push('topP must be a number between 0 and 1');
      }
    }

    if (settings.topK !== undefined) {
      if (typeof settings.topK !== 'number' || settings.topK < 1) {
        errors.push('topK must be a positive integer');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      return await this.ollamaService.isOllamaReady();
    } catch (error) {
      return false;
    }
  }
}
