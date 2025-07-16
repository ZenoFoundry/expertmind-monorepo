import { ChatRequestDto, GenerateRequestDto } from '../dtos/chat-request.dto';
import { ChatResponse, GenerateResponse, ModelInfo } from '../dtos/ollama-response.dto';

export const mockChatRequest: ChatRequestDto = {
  model: 'tinyllama',
  messages: [
    {
      role: 'user',
      content: 'Hola, ¿cómo estás?',
    },
  ],
  options: {
    temperature: 0.7,
  },
};

export const mockGenerateRequest: GenerateRequestDto = {
  model: 'tinyllama',
  prompt: 'Explica qué es la inteligencia artificial',
  options: {
    temperature: 0.7,
  },
};

export const mockChatResponse: ChatResponse = {
  model: 'tinyllama',
  message: {
    role: 'assistant',
    content: '¡Hola! Estoy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?',
  },
  created_at: '2024-01-01T00:00:00Z',
  done: true,
  total_duration: 1000000000,
  load_duration: 500000000,
  prompt_eval_count: 10,
  prompt_eval_duration: 100000000,
  eval_count: 20,
  eval_duration: 400000000,
};

export const mockGenerateResponse: GenerateResponse = {
  model: 'tinyllama',
  created_at: '2024-01-01T00:00:00Z',
  response: 'La inteligencia artificial es...',
  done: true,
  total_duration: 1000000000,
  load_duration: 500000000,
  prompt_eval_count: 10,
  prompt_eval_duration: 100000000,
  eval_count: 50,
  eval_duration: 400000000,
};

export const mockModelInfo: ModelInfo[] = [
  {
    name: 'tinyllama',
    modified_at: '2024-01-01T00:00:00Z',
    size: 1000000,
    digest: 'sha256:abc123',
    details: {
      format: 'gguf',
      family: 'llama',
      parameter_size: '1.1B',
      quantization_level: 'Q4_0',
    },
  },
  {
    name: 'llama2:13b',
    modified_at: '2024-01-01T00:00:00Z',
    size: 13000000000,
    digest: 'sha256:def456',
    details: {
      format: 'gguf',
      family: 'llama',
      parameter_size: '13B',
      quantization_level: 'Q4_0',
    },
  },
];

export class MockOllamaService {
  async getModels(): Promise<ModelInfo[]> {
    return mockModelInfo;
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponse> {
    return mockChatResponse;
  }

  async generate(generateRequest: GenerateRequestDto): Promise<GenerateResponse> {
    return mockGenerateResponse;
  }

  async pullModel(modelName: string): Promise<{ status: string }> {
    return { status: 'success' };
  }

  async isOllamaReady(): Promise<boolean> {
    return true;
  }
}
