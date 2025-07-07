# 🤖 ExpertMind + Ollama Integration Guide

## 📋 **TL;DR - Quick Setup**

1. **Backend**: `yarn docker:up` o `yarn start` (puerto 3001)
2. **Frontend**: `chmod +x integrate-ollama.sh && ./integrate-ollama.sh`
3. **Test**: `yarn dev:frontend` y configurar en UI

---

## 🔍 **Problema Identificado**

### Frontend Original:
```json
{
  "message": "texto del usuario",
  "config": { "model": "gpt-3.5-turbo" }
}
```

### Tu Backend Ollama:
```json
{
  "model": "tinyllama",
  "messages": [
    { "role": "user", "content": "texto del usuario" }
  ]
}
```

## 🛠️ **Archivos Creados**

### 1. `src/utils/ollama-api.ts`
- **OllamaApiManager**: Clase específica para tu backend
- **Formato correcto**: Transforma mensajes al formato Ollama
- **Historial de conversación**: Mantiene contexto entre mensajes
- **Validaciones específicas**: Para modelos y configuración Ollama

### 2. `src/App-ollama.tsx`
- **Integración completa**: Usa OllamaApiManager en lugar de ApiManager genérico
- **Gestión de historial**: Sincroniza conversaciones con base de datos
- **Indicador de estado**: Muestra conexión con backend y modelos disponibles

### 3. `src/components/ConfigPanel-ollama.tsx`
- **Presets específicos**: Configuraciones optimizadas para Ollama
- **Modelos recomendados**: TinyLlama, Gemma2, Phi3, etc.
- **Test de conexión**: Verifica backend + Ollama
- **UI optimizada**: Para configuraciones específicas de Ollama

---

## 🚀 **Integración Automática**

```bash
# Ejecutar desde root del proyecto
chmod +x integrate-ollama.sh
./integrate-ollama.sh
```

### Qué hace el script:
1. ✅ Backup de archivos originales
2. ✅ Aplica versiones optimizadas para Ollama
3. ✅ Mantiene compatibilidad con sistema original

---

## 🔗 **Curl Commands para Testing**

### **Health Checks**
```bash
# 1. Backend funcionando
curl http://localhost:3001/health

# 2. Estado de Ollama
curl http://localhost:3001/ollama/status

# 3. Modelos disponibles
curl http://localhost:3001/ollama/models
```

### **Chat con Ollama (Como lo usa el frontend)**
```bash
# Mensaje simple
curl -X POST http://localhost:3001/ollama/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tinyllama",
    "messages": [
      {
        "role": "user",
        "content": "Hola, ¿puedes explicarme qué es la inteligencia artificial?"
      }
    ]
  }'

# Con configuración personalizada
curl -X POST http://localhost:3001/ollama/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tinyllama",
    "messages": [
      {
        "role": "system",
        "content": "Eres un asistente experto en tecnología."
      },
      {
        "role": "user",
        "content": "¿Cuáles son las ventajas de usar Docker?"
      }
    ],
    "options": {
      "temperature": 0.7,
      "num_ctx": 2048
    }
  }'

# Conversación con contexto
curl -X POST http://localhost:3001/ollama/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tinyllama",
    "messages": [
      {
        "role": "user",
        "content": "¿Qué es React?"
      },
      {
        "role": "assistant", 
        "content": "React es una biblioteca de JavaScript para construir interfaces de usuario..."
      },
      {
        "role": "user",
        "content": "¿Y qué ventajas tiene sobre Vue?"
      }
    ]
  }'
```

### **Generate (Respuesta simple)**
```bash
# Para completar texto
curl -X POST http://localhost:3001/ollama/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tinyllama",
    "prompt": "Explica en pocas palabras qué es React.js"
  }'
```

### **Gestión de modelos**
```bash
# Descargar TinyLlama
curl -X POST http://localhost:3001/ollama/pull/tinyllama

# Descargar Gemma 2B
curl -X POST http://localhost:3001/ollama/pull/gemma2:2b
```

---

## 📱 **Configuración en la UI**

### 1. **Abrir panel de configuración**
- Click en ⚙️ en el sidebar

### 2. **Usar preset "Local Development"**
- URL: `http://localhost:3001`
- Modelo: `tinyllama`
- Temperature: `0.7`

### 3. **Test conexión**
- Click "🔗 Test Connection"
- Click "📋 Get Models" para ver modelos disponibles

### 4. **Guardar configuración**
- Click "💾 Save Configuration"

---

## 🔧 **Flujo de Datos Completo**

```
Usuario escribe mensaje
    ↓
MessageInput.tsx → onSendMessage()
    ↓
App.tsx → sendMessage()
    ↓
OllamaApiManager.sendMessage()
    ↓
POST http://localhost:3001/ollama/chat
    ↓
NestJS Backend → OllamaController.chat()
    ↓
OllamaService.chat()
    ↓
POST http://localhost:11434/api/chat (Ollama)
    ↓
Respuesta de Ollama
    ↓
Backend → Frontend → UI
```

---

## 🐛 **Troubleshooting**

### **Error: EADDRINUSE port 3001**
```bash
yarn docker:down  # Detener Docker
yarn start        # O ejecutar localmente
```

### **Error: Ollama not ready**
```bash
# Verificar Docker
docker ps | grep ollama

# O instalar Ollama localmente
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
ollama pull tinyllama
```

### **Frontend no conecta**
1. ✅ Backend en puerto 3001: `curl http://localhost:3001/health`
2. ✅ Ollama funcionando: `curl http://localhost:3001/ollama/status`
3. ✅ Configuración UI: URL = `http://localhost:3001`

### **Error de CORS**
- Ya está configurado en `main.ts` del backend
- Permite `http://localhost:5173` (Vite) y `http://localhost:3000`

---

## 🎯 **Modelos Recomendados**

| Modelo | Tamaño | Velocidad | Uso |
|--------|--------|-----------|-----|
| `tinyllama` | 1.1B | 🚀🚀🚀 | Desarrollo rápido |
| `gemma2:2b` | 2B | 🚀🚀 | Balanceado |
| `phi3:mini` | 3.8B | 🚀 | Mejor calidad |
| `llama3.2:3b` | 3B | 🚀 | Multilenguaje |
| `codellama:7b` | 7B | 🐌 | Programación |

---

## 🔄 **Revertir Cambios**

```bash
# Volver a la configuración original
cp apps/frontend/src/App-original.tsx apps/frontend/src/App.tsx
cp apps/frontend/src/components/ConfigPanel-original.tsx apps/frontend/src/components/ConfigPanel.tsx
```

---

## 🎉 **¡Listo para usar!**

Ahora tu frontend está completamente integrado con tu backend de Ollama. El chatbox enviará mensajes en el formato correcto y mantendrá el historial de conversación.

**¿Funciona todo?** Prueba enviando: "Hola, explícame qué es JavaScript"
