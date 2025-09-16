# ConfigPanelUnified

Panel de configuración unificado que permite elegir y configurar diferentes proveedores de IA.

## Características

### 🤖 **Soporte para Proveedores**
- **Agno**: Advanced AI Agents con framework Agno
- **Ollama**: Local LLM Runtime

### ⚙️ **Configuraciones por Proveedor**

#### **Agno Configuration**
- **Modelos disponibles:**
  - `gpt-4.1` - Most capable model
  - `o4-mini` - Faster and cheaper

- **Agentes disponibles:**
  - `agno_assist` - General AI assistant with Agno framework knowledge
  - `web_agent` - Web browsing and research capabilities
  - `finance_agent` - Financial analysis and market insights

- **Configuraciones avanzadas:**
  - Stream responses (boolean)
  - User ID (opcional)
  - Session ID (opcional)
  - System prompt (opcional)

#### **Ollama Configuration**
- **Modelos recomendados:**
  - `tinyllama` - Fastest (1.1B parameters)
  - `gemma2:2b` - Fast (2B parameters)
  - `phi3:mini` - Balanced (3.8B parameters)
  - `llama3.2:3b` - Powerful (3B parameters)

- **Configuraciones específicas:**
  - Context Length (1024, 2048, 4096, 8192 tokens)
  - Keep Alive (opcional)

### 🚀 **Quick Setup Presets**

#### **Agno Presets**
- **Local Development**: `http://localhost:8000`
- **Docker Container**: `http://agent-api:8000`

#### **Ollama Presets**
- **Local Development**: `http://localhost:3001`
- **Docker Container**: `http://backend:3001`

### 🔧 **Configuraciones Comunes**
- **Temperature**: 0.0 - 2.0 (slider)
- **Max Tokens**: 1000, 2000, 4000, 8000
- **Timeout**: 30s, 60s, 2min, 5min

### 🔗 **Test de Conexión**
- **Agno**: Health check en `/v1/health`
- **Ollama**: Status check en `/ollama/status`
- Timeout de 10 segundos
- Mensajes de error específicos

## Uso

```tsx
import { ConfigPanelUnified } from './components';

<ConfigPanelUnified
  apiConfig={apiConfig}
  onUpdateConfig={saveApiConfig}
  onClose={() => setShowConfig(false)}
/>
```

## Estructura de Datos

La configuración se guarda en `ApiConfig` con metadata extendida:

```typescript
interface ApiConfig {
  url: string;
  apiKey: string;
  headers: Record<string, string>;
  timeout: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: {
    provider?: 'agno' | 'ollama';
    agno?: {
      model: 'gpt-4.1' | 'o4-mini';
      agent: 'agno_assist' | 'web_agent' | 'finance_agent';
      systemPrompt?: string;
      userId?: string;
      sessionId?: string;
      stream: boolean;
    };
    ollama?: {
      model: string;
      contextLength: number;
      keepAlive?: string;
    };
  };
}
```

## Endpoints Utilizados

### **Agno Agent API**
- **Health**: `GET /v1/health`
- **Chat**: `POST /v1/agents/{agent_id}/runs`
- **Models**: gpt-4.1, o4-mini
- **Agents**: agno_assist, web_agent, finance_agent

### **Ollama Backend**
- **Status**: `GET /ollama/status`
- **Chat**: `POST /ollama/chat`
- **Models**: Via backend detection

## Features

- ✅ Auto-detección de proveedor basado en URL
- ✅ Presets rápidos para desarrollo local y Docker
- ✅ Configuraciones específicas por proveedor
- ✅ Test de conexión con mensajes específicos
- ✅ Configuraciones avanzadas colapsables
- ✅ Validación y reset a defaults
- ✅ Interface moderna y responsiva
