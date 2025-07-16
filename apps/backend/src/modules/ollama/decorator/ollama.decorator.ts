import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

/**
 * Decorador para validar que el modelo solicitado esté disponible
 */
export const RequireModel = (model?: string) => SetMetadata('require-model', model);

/**
 * Decorador para obtener el modelo desde el request
 */
export const Model = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.body?.model || request.params?.model;
  },
);

/**
 * Decorador para marcar endpoints que requieren Ollama activo
 */
export const RequireOllama = () => SetMetadata('require-ollama', true);

/**
 * Decorador para limitar el rate de llamadas a Ollama
 */
export const OllamaRateLimit = (limit: number) => SetMetadata('ollama-rate-limit', limit);

/**
 * Decorador para cachear respuestas de Ollama
 */
export const CacheOllamaResponse = (ttl: number) => SetMetadata('cache-ollama-response', ttl);

/**
 * Decorador para obtener las opciones de Ollama desde el request
 */
export const OllamaOptions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.body?.options || {};
  },
);

/**
 * Decorador para obtener el contexto de conversación
 */
export const ConversationContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      conversationId: request.headers['x-conversation-id'],
      userId: request.user?.id,
      sessionId: request.session?.id,
    };
  },
);

/**
 * Decorador para validar el tamaño máximo del prompt
 */
export const MaxPromptSize = (size: number) => SetMetadata('max-prompt-size', size);

/**
 * Decorador para indicar que el endpoint soporta streaming
 */
export const SupportsStreaming = () => SetMetadata('supports-streaming', true);
