import { ApiConfig, ApiResponse } from '@/types';
import { HttpInterceptor } from './httpInterceptor';
import { authService } from '../services/authService';

// Tipos de API soportados
type ApiProvider = 'anthropic' | 'ollama';

// Clase para manejar las comunicaciones con la API
export class ApiManager {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  // Actualizar configuración de la API
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obtener configuración actual
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  // Detectar qué tipo de API estamos usando
  private detectApiProvider(): ApiProvider {
    const url = this.config.url.toLowerCase();
    
    // Si la URL contiene 'anthropic' o si estamos usando el proxy local para Anthropic
    if (url.includes('anthropic') || url.includes('/api/anthropic')) {
      return 'anthropic';
    }
    
    // Por defecto, asumir Ollama
    return 'ollama';
  }

  // Preparar headers según el proveedor de API
  private prepareHeaders(provider: ApiProvider): Record<string, string> {
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers
    };

    // El interceptor se encargará de añadir el Authorization header automáticamente
    // para requests a nuestro backend

    if (provider === 'anthropic') {
      // Headers específicos para Anthropic
      if (this.config.apiKey) {
        baseHeaders['x-api-key'] = this.config.apiKey;
      }
      baseHeaders['anthropic-version'] = '2023-06-01';
      // Header requerido para acceso directo desde navegador
      baseHeaders['anthropic-dangerous-direct-browser-access'] = 'true';
    } else {
      // Headers para Ollama u otras APIs
      if (this.config.apiKey) {
        baseHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
      }
    }

    return baseHeaders;
  }

  // Preparar payload según el proveedor de API
  private preparePayload(message: string, provider: ApiProvider): any {
    if (provider === 'anthropic') {
      // Formato para Anthropic Claude
      return {
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: this.config.maxTokens || 1024,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        ...(this.config.temperature !== undefined && { temperature: this.config.temperature })
      };
    } else {
      // Formato para Ollama (formato actual)
      return {
        model: this.config.model || 'llama2',
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        options: {
          temperature: this.config.temperature,
          num_ctx: this.config.maxTokens
        }
      };
    }
  }

  // Procesar respuesta según el proveedor de API
  private processResponse(data: any, provider: ApiProvider): { content: string; error?: string } {
    try {
      if (provider === 'anthropic') {
        // Procesar respuesta de Anthropic
        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
          const textContent = data.content.find((item: any) => item.type === 'text');
          if (textContent) {
            return {
              content: textContent.text,
              error: undefined
            };
          }
        }
        
        // Si no encontramos contenido en el formato esperado
        return {
          content: '',
          error: 'Invalid response format from Anthropic API'
        };

      } else {
        // Procesar respuesta de Ollama (lógica existente)
        if (data.success && data.data) {
          const content = data.data.message?.content || data.data.response || 'No response content';
          return {
            content,
            error: undefined
          };
        } else {
          return {
            content: '',
            error: data.message || 'Unknown error from backend'
          };
        }
      }
    } catch (error) {
      return {
        content: '',
        error: `Error processing ${provider} response: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Enviar mensaje a la API
  async sendMessage(
    message: string, 
    attachments?: Array<{ name: string; content: string; type: string }>
  ): Promise<ApiResponse> {
    try {
      const provider = this.detectApiProvider();
      
      console.log(`🔍 Detected API provider: ${provider}`);
      console.log(`📡 Using URL: ${this.config.url}`);

      // Preparar headers y payload según el proveedor
      const headers = this.prepareHeaders(provider);
      const payload = this.preparePayload(message, provider);

      console.log('📤 Request headers:', headers);
      console.log('📤 Request payload:', JSON.stringify(payload, null, 2));

      // Información sobre autenticación
      if (authService.isAuthenticated()) {
        console.log('🔐 Usuario autenticado - Token será añadido automáticamente');
      } else {
        console.log('🔓 Usuario anónimo - Sin token');
      }

      // Crear controlador para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Realizar la petición usando el interceptor
      const response = await HttpInterceptor.fetch(this.config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      // Parsear la respuesta
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      // Procesar respuesta según el proveedor
      return this.processResponse(data, provider);

    } catch (error) {
      console.error('❌ Request error:', error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            content: '',
            error: `Request timed out after ${this.config.timeout}ms`
          };
        }
        
        return {
          content: '',
          error: error.message
        };
      }

      return {
        content: '',
        error: 'Unknown error occurred'
      };
    }
  }

  // Validar configuración de la API
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const provider = this.detectApiProvider();

    // Validar URL
    if (!this.config.url) {
      errors.push('API URL is required');
    } else {
      try {
        new URL(this.config.url);
      } catch {
        errors.push('API URL is not valid');
      }
    }

    // Validar API Key para Anthropic
    if (provider === 'anthropic' && !this.config.apiKey) {
      errors.push('API Key is required for Anthropic API');
    }

    // Validar timeout
    if (this.config.timeout <= 0) {
      errors.push('Timeout must be greater than 0');
    }

    // Validar temperatura si está configurada
    if (this.config.temperature !== undefined) {
      if (this.config.temperature < 0 || this.config.temperature > 2) {
        errors.push('Temperature must be between 0 and 2');
      }
    }

    // Validar maxTokens si está configurado
    if (this.config.maxTokens !== undefined) {
      if (this.config.maxTokens <= 0) {
        errors.push('Max tokens must be greater than 0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Probar conexión con la API
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage = 'Test connection';
      const response = await this.sendMessage(testMessage);
      
      if (response.error) {
        return {
          success: false,
          error: response.error
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Configuración por defecto - AGNO a través del backend
export const defaultApiConfig: ApiConfig = {
  url: 'http://localhost:3001', // Backend que se conecta a Agno
  apiKey: '',
  headers: {},
  timeout: 60000, // 60 segundos para Agno
  model: 'gpt-4.1', // Modelo más capaz de Agno
  temperature: 0.7,
  maxTokens: 2000,
  metadata: {
    provider: 'agno',
    agno: {
      model: 'gpt-4.1',
      agent: 'agno_assist',
      stream: false
    }
  }
};

// Configuración para Anthropic (ejemplo)
export const anthropicApiConfig: ApiConfig = {
  url: '/api/anthropic/v1/messages', // URL del proxy local
  apiKey: '', // Se debe configurar desde la UI
  headers: {},
  timeout: 30000,
  model: 'claude-3-haiku-20240307',
  temperature: 0.7,
  maxTokens: 1024
};

// Configuración para Ollama (alternativa)
export const ollamaApiConfig: ApiConfig = {
  url: 'http://localhost:3001',
  apiKey: '',
  headers: {},
  timeout: 60000,
  model: 'tinyllama',
  temperature: 0.7,
  maxTokens: 2048,
  metadata: {
    provider: 'ollama',
    ollama: {
      model: 'tinyllama',
      contextLength: 2048
    }
  }
};
