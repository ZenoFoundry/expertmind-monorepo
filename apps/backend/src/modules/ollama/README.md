# Módulo Ollama

Este módulo proporciona integración con Ollama para el backend de ExpertMind.

## Estructura de Directorios

```
ollama/
├── controller/           # Controladores HTTP
│   └── ollama.controller.ts
├── decorator/           # Decoradores personalizados
│   └── ollama.decorator.ts
├── dtos/               # Data Transfer Objects
│   ├── api-response.dto.ts
│   ├── chat-request.dto.ts
│   └── ollama-response.dto.ts
├── mappers/            # Mappers para transformación de datos
│   ├── chat-response.mapper.ts
│   └── generate-response.mapper.ts
├── mock/               # Mocks para testing
│   └── ollama.mock.ts
├── services/           # Lógica de negocio
│   ├── ollama.service.ts
│   └── ollama-api.client.ts
├── utils/              # Utilidades y helpers
│   └── ollama.utils.ts
├── index.ts           # Exportaciones del módulo
├── ollama.module.ts   # Definición del módulo NestJS
└── README.md          # Este archivo
```

## Características

### Services
- **OllamaService**: Servicio principal que maneja la lógica de negocio
- **OllamaApiClient**: Cliente HTTP para comunicarse con la API de Ollama

### DTOs
- **ChatRequestDto**: DTO para solicitudes de chat
- **GenerateRequestDto**: DTO para solicitudes de generación
- **ApiResponseDto**: DTO genérico para respuestas de la API

### Mappers
- **ChatResponseMapper**: Transforma respuestas de chat
- **GenerateResponseMapper**: Transforma respuestas de generación

### Decoradores
- `@RequireModel()`: Valida que el modelo esté disponible
- `@RequireOllama()`: Requiere que Ollama esté activo
- `@OllamaRateLimit()`: Limita el rate de llamadas
- `@CacheOllamaResponse()`: Cachea respuestas
- `@Model`: Obtiene el modelo del request
- `@OllamaOptions`: Obtiene las opciones del request

### Utilidades
- Constantes de configuración
- Validadores
- Helpers para formateo y parsing

## Uso

```typescript
import { OllamaModule } from '@/modules/ollama';

@Module({
  imports: [OllamaModule],
})
export class AppModule {}
```

## Endpoints

- `GET /ollama/models` - Obtener modelos disponibles
- `GET /ollama/status` - Verificar estado de Ollama
- `POST /ollama/chat` - Iniciar conversación
- `POST /ollama/generate` - Generar respuesta
- `POST /ollama/pull/:modelName` - Descargar modelo

## Configuración

Variables de entorno:
- `OLLAMA_URL`: URL de Ollama (default: http://localhost:11434)

## Testing

```typescript
import { MockOllamaService, mockChatRequest } from '@/modules/ollama';

// Usar en tests
providers: [
  {
    provide: OllamaService,
    useClass: MockOllamaService,
  },
],
```
