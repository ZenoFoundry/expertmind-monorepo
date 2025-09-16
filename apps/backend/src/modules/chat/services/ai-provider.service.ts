import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IAIProvider, AIMessageRequest, AIMessageResponse, AIModel, ValidationResult } from '../interfaces/ai-provider.interface';
import { AgnoService } from '../../agno/services/agno.service';
import { AgnoModel } from '../../agno/dtos/agno-request.dto';

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private providers: Map<string, IAIProvider> = new Map();

  constructor(
    private readonly agnoService: AgnoService
  ) {
    // Registrar proveedores disponibles
    this.registerProvider(new AgnoAIProvider(agnoService));
  }

  registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered AI provider: ${provider.name}`);
  }

  getProvider(name: string): IAIProvider {
    // Mapear proveedores deprecados a nuevos proveedores
    const providerMap: Record<string, string> = {
      'ollama': 'agno', // Mapear ollama a agno automáticamente
    };
    
    const actualProviderName = providerMap[name] || name;
    
    const provider = this.providers.get(actualProviderName);
    if (!provider) {
      throw new BadRequestException(`AI provider '${actualProviderName}' not found`);
    }
    
    // Log del mapeo si es diferente
    if (actualProviderName !== name) {
      this.logger.log(`Mapped provider '${name}' to '${actualProviderName}'`);
    }
    
    return provider;
  }

  getAvailableProviders(): string[] {
    const actualProviders = Array.from(this.providers.keys());
    // Incluir también los mapeos para compatibilidad
    const mappedProviders = ['ollama']; // ollama mapea a agno
    return [...actualProviders, ...mappedProviders];
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
// agno-ai-provider.ts
// ===============================
class AgnoAIProvider implements IAIProvider {
  readonly name = 'agno';
  readonly supportedModels: string[] = [
    AgnoModel.GPT_4_1,
    AgnoModel.O4_MINI
  ];

  constructor(private readonly agnoService: AgnoService) {}

  async sendMessage(request: AIMessageRequest): Promise<AIMessageResponse> {
    try {
      // Convertir mensajes al formato de Agno
      const message = this.formatMessagesForAgno(request.messages);
      
      // Mapear modelo si es necesario
      const agnoModel = this.mapToAgnoModel(request.model);

      const agnoRequest = {
        message,
        model: agnoModel,
        stream: false, // Por ahora no soportamos streaming
        user_id: request.userId,
        session_id: request.sessionId,
      };

      const response = await this.agnoService.runDefaultAgent(agnoRequest);
      
      return {
        content: response.content,
        metadata: {
          model: request.model,
          tokensUsed: 0, // Agno no proporciona esta información por ahora
          processingTimeMs: 0, // Se calculará en AIProviderService
          finishReason: 'stop',
          agentId: response.metadata?.agent_id,
          userId: response.metadata?.user_id,
          sessionId: response.metadata?.session_id,
        }
      };
    } catch (error) {
      this.logger.error('Error en AgnoAIProvider:', error);
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
      // Devolver modelos estáticos por ahora
      return [
        {
          name: AgnoModel.GPT_4_1,
          displayName: 'GPT-4.1',
          description: 'Agno GPT-4.1 model with advanced reasoning capabilities',
          maxTokens: 8192,
          supportedFeatures: ['chat', 'completion', 'function_calling'],
          metadata: {
            provider: 'agno',
            type: 'chat'
          }
        },
        {
          name: AgnoModel.O4_MINI,
          displayName: 'O4 Mini',
          description: 'Agno O4 Mini model for faster responses',
          maxTokens: 4096,
          supportedFeatures: ['chat', 'completion'],
          metadata: {
            provider: 'agno',
            type: 'chat'
          }
        }
      ];
    } catch (error) {
      throw new Error(`Failed to get Agno models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateSettings(settings: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones específicas para Agno
    if (settings.model && !this.supportedModels.includes(settings.model)) {
      errors.push(`Model '${settings.model}' is not supported. Supported models: ${this.supportedModels.join(', ')}`);
    }

    if (settings.userId && typeof settings.userId !== 'string') {
      errors.push('userId must be a string');
    }

    if (settings.sessionId && typeof settings.sessionId !== 'string') {
      errors.push('sessionId must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      return await this.agnoService.isAgnoReady();
    } catch (error) {
      return false;
    }
  }

  /**
   * Convierte los mensajes del formato estándar al formato que espera Agno
   */
  private formatMessagesForAgno(messages: Array<{ role: string; content: string }>): string {
    // Si hay múltiples mensajes, combinarlos en un solo string
    // Agno espera un mensaje simple, no un array de mensajes
    
    if (messages.length === 1) {
      return messages[0].content;
    }

    // Si hay múltiples mensajes, formatear como conversación
    return messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Mapea modelos del sistema estándar a modelos de Agno
   */
  private mapToAgnoModel(model: string): AgnoModel {
    // Mapeo de modelos comunes a modelos de Agno
    const modelMap: Record<string, AgnoModel> = {
      'gpt-4': AgnoModel.GPT_4_1,
      'gpt-4.1': AgnoModel.GPT_4_1,
      'gpt-4-turbo': AgnoModel.GPT_4_1,
      'o4-mini': AgnoModel.O4_MINI,
      'gpt-3.5-turbo': AgnoModel.O4_MINI, // Fallback a modelo más pequeño
    };

    return modelMap[model] || AgnoModel.GPT_4_1; // Default a GPT-4.1
  }

  private readonly logger = new Logger(AgnoAIProvider.name);
}
