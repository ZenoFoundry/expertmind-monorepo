/**
 * Constantes relacionadas con Ollama
 */
export const OLLAMA_CONSTANTS = {
  DEFAULT_URL: 'http://localhost:11434',
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_MAX_RETRIES: 3,
  ENDPOINTS: {
    MODELS: '/api/tags',
    CHAT: '/api/chat',
    GENERATE: '/api/generate',
    PULL: '/api/pull',
  },
  DEFAULT_OPTIONS: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    num_ctx: 2048,
  },
} as const;

/**
 * Tipos de modelos soportados
 */
export enum ModelType {
  TINYLLAMA = 'tinyllama',
  LLAMA2 = 'llama2',
  LLAMA2_13B = 'llama2:13b',
  CODELLAMA = 'codellama',
  MISTRAL = 'mistral',
  MIXTRAL = 'mixtral',
}

/**
 * Validar si un modelo está soportado
 */
export function isModelSupported(model: string): boolean {
  return Object.values(ModelType).includes(model as ModelType);
}

/**
 * Formatear duración de nanosegundos a milisegundos
 */
export function formatDuration(nanoseconds?: number): number | undefined {
  if (!nanoseconds) return undefined;
  return Math.round(nanoseconds / 1000000);
}

/**
 * Calcular tokens por segundo
 */
export function calculateTokensPerSecond(
  evalCount?: number,
  evalDuration?: number,
): number | undefined {
  if (!evalCount || !evalDuration) return undefined;
  return Math.round((evalCount / evalDuration) * 1000000000);
}

/**
 * Validar opciones de Ollama
 */
export function validateOllamaOptions(options: any): boolean {
  if (!options) return true;
  
  const validKeys = ['temperature', 'top_p', 'top_k', 'num_ctx', 'repeat_penalty', 'seed'];
  const keys = Object.keys(options);
  
  return keys.every(key => validKeys.includes(key));
}

/**
 * Normalizar nombre de modelo
 */
export function normalizeModelName(model: string): string {
  return model.toLowerCase().trim();
}

/**
 * Extraer información del modelo desde su nombre
 */
export function parseModelName(modelName: string): {
  base: string;
  variant?: string;
  tag?: string;
} {
  const parts = modelName.split(':');
  const base = parts[0];
  
  if (parts.length === 1) {
    return { base };
  }
  
  const variantAndTag = parts[1].split('-');
  const variant = variantAndTag[0];
  const tag = variantAndTag.length > 1 ? variantAndTag.slice(1).join('-') : undefined;
  
  return { base, variant, tag };
}

/**
 * Generar un ID único para una conversación
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncar mensaje si excede un límite
 */
export function truncateMessage(message: string, maxLength: number = 1000): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Validar formato de respuesta de Ollama
 */
export function isValidOllamaResponse(response: any): boolean {
  return response && 
         typeof response.model === 'string' &&
         typeof response.done === 'boolean';
}
