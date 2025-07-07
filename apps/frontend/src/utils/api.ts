import { ApiConfig, ApiResponse } from '@/types';

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

  // Enviar mensaje a la API
  async sendMessage(
    message: string, 
    attachments?: Array<{ name: string; content: string; type: string }>
  ): Promise<ApiResponse> {
    try {
      // Preparar el payload según el formato esperado por Ollama
      const payload = {
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

      // Preparar headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.config.headers
      };

      // Agregar API Key si está configurada
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      // Crear controlador para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Realizar la petición
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      // Parsear la respuesta
      const data = await response.json();
      
      // Adaptar la respuesta según el formato del backend Ollama
      if (data.success && data.data) {
        // Formato del backend: { success: true, data: { message: { content: "..." } } }
        const content = data.data.message?.content || data.data.response || 'No response content';
        return {
          content,
          error: undefined
        };
      } else {
        // Error del backend
        return {
          content: '',
          error: data.message || 'Unknown error from backend'
        };
      }

    } catch (error) {
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

// Configuración por defecto
export const defaultApiConfig: ApiConfig = {
  url: 'http://localhost:3001/ollama/chat',
  apiKey: '',
  headers: {},
  timeout: 30000, // 30 segundos
  model: 'tinyllama', // modelo más rápido para desarrollo
  temperature: 0.7,
  maxTokens: 1000
};
