import { ApiConfig, ApiResponse } from '@/types';

// Tipos específicos para Ollama
export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_ctx?: number;
  };
}

export interface OllamaChatResponse {
  success: boolean;
  data?: {
    model: string;
    message: {
      role: string;
      content: string;
    };
    created_at: string;
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
  };
  message?: string;
  error?: string;
}

// Clase específica para comunicación con backend de Ollama
export class OllamaApiManager {
  private config: ApiConfig;
  private conversationHistory: OllamaMessage[] = [];

  constructor(config: ApiConfig) {
    this.config = config;
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obtener configuración actual
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  // Limpiar historial de conversación
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Agregar mensaje al historial
  addToHistory(message: OllamaMessage): void {
    this.conversationHistory.push(message);
  }

  // Enviar mensaje a la API de Ollama
  async sendMessage(
    message: string, 
    attachments?: Array<{ name: string; content: string; type: string }>
  ): Promise<ApiResponse> {
    try {
      // Agregar mensaje del usuario al historial
      const userMessage: OllamaMessage = {
        role: 'user',
        content: message
      };
      
      this.addToHistory(userMessage);

      // Preparar el payload para Ollama
      const payload: OllamaChatRequest = {
        model: this.config.model || 'tinyllama',
        messages: [...this.conversationHistory], // Enviar todo el historial
        options: {
          temperature: this.config.temperature || 0.7,
          num_ctx: this.config.maxTokens || 2048
        }
      };

      // Preparar headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.config.headers
      };

      // Agregar API Key si está configurada (aunque Ollama local no la necesita)
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      console.log('🚀 Enviando a Ollama:', {
        url: `${this.config.url}/ollama/chat`,
        payload: JSON.stringify(payload, null, 2)
      });

      // Crear controlador para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Realizar la petición al endpoint /ollama/chat
      const response = await fetch(`${this.config.url}/ollama/chat`, {
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
      const data: OllamaChatResponse = await response.json();
      
      console.log('📩 Respuesta de Ollama:', data);

      // Verificar si la respuesta fue exitosa
      if (!data.success) {
        throw new Error(data.message || data.error || 'Unknown error from Ollama');
      }

      // Extraer el contenido de la respuesta
      const assistantContent = data.data?.message?.content || 'No response content';
      
      // Agregar respuesta del asistente al historial
      const assistantMessage: OllamaMessage = {
        role: 'assistant',
        content: assistantContent
      };
      
      this.addToHistory(assistantMessage);

      return {
        content: assistantContent,
        error: undefined
      };

    } catch (error) {
      console.error('❌ Error comunicándose con Ollama:', error);
      
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

    // Validar que sea una URL local (opcional)
    if (this.config.url && !this.config.url.includes('localhost') && !this.config.url.includes('127.0.0.1')) {
      console.warn('⚠️ Warning: Ollama typically runs on localhost');
    }

    // Validar timeout
    if (this.config.timeout <= 0) {
      errors.push('Timeout must be greater than 0');
    }

    // Validar temperatura
    if (this.config.temperature !== undefined) {
      if (this.config.temperature < 0 || this.config.temperature > 2) {
        errors.push('Temperature must be between 0 and 2');
      }
    }

    // Validar modelo
    if (!this.config.model) {
      console.warn('⚠️ Warning: No model specified, using default "tinyllama"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Probar conexión con Ollama
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Probar primero el endpoint de estado
      const statusResponse = await fetch(`${this.config.url}/ollama/status`);
      
      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (!statusData.success || !statusData.data?.ollama_ready) {
        throw new Error('Ollama is not ready');
      }

      // Probar envío de mensaje simple
      const testMessage = 'Hello, this is a connection test.';
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

  // Obtener modelos disponibles
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.url}/ollama/models`);
      
      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.map((model: any) => model.name);
      }

      return [];
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }
}

// Configuración por defecto para Ollama
export const defaultOllamaConfig: ApiConfig = {
  url: 'http://localhost:3001', // Tu backend NestJS
  apiKey: '', // Ollama local no necesita API key
  headers: {},
  timeout: 60000, // 60 segundos (Ollama puede ser lento)
  model: 'tinyllama', // Modelo por defecto más rápido
  temperature: 0.7,
  maxTokens: 2048
};
