// ===============================
// ai-provider.interface.ts
// ===============================

export interface IAIProvider {
  readonly name: string;
  readonly supportedModels: string[];
  
  sendMessage(request: AIMessageRequest): Promise<AIMessageResponse>;
  getAvailableModels(): Promise<AIModel[]>;
  validateSettings(settings: Record<string, any>): ValidationResult;
  isHealthy(): Promise<boolean>;
}

export interface AIMessageRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    [key: string]: any;
  };
  conversationId?: string;
  userId?: string;
  sessionId?: string;
}

export interface AIMessageResponse {
  content: string;
  metadata: {
    model: string;
    tokensUsed?: number;
    processingTimeMs: number;
    finishReason?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface AIModel {
  name: string;
  displayName: string;
  description?: string;
  maxTokens?: number;
  supportedFeatures: string[];
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
