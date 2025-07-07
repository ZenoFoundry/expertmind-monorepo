# 🚀 Inicio Rápido - ExpertMind Backend

## Opción 1: Con Docker (Recomendado)

Desde la raíz del monorepo:

```bash
# Iniciar todos los servicios (backend, frontend, ollama)
yarn docker:up

# Esperar a que descargue TinyLlama (puede tomar unos minutos)
yarn docker:logs:ollama

# Probar la API
curl http://localhost:3001/health
```

## Opción 2: Desarrollo Local

```bash
# En apps/backend
cd apps/backend

# Instalar dependencias
yarn install

# Configurar entorno
cp .env.example .env

# Iniciar Ollama manualmente
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec ollama ollama pull tinyllama

# Iniciar backend
yarn start:dev
```

## 🧪 Probar Conexión

```bash
# Hacer ejecutable el script de prueba
chmod +x apps/backend/scripts/test-ollama.sh

# Ejecutar pruebas
./apps/backend/scripts/test-ollama.sh
```

## 📚 Endpoints Principales

- **Health:** http://localhost:3001/health
- **Swagger:** http://localhost:3001/api
- **Chat:** POST http://localhost:3001/ollama/chat
- **Modelos:** GET http://localhost:3001/ollama/models

## ⚡ Ejemplo de Chat

```bash
curl -X POST http://localhost:3001/ollama/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama",
    "messages": [{"role": "user", "content": "Hola!"}]
  }'
```

¡Tu backend con Ollama está listo! 🎉
