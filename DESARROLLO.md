# 🚀 ExpertMind - Guía de Inicio Rápido

## 📋 Prerrequisitos

- Node.js 18+ 
- Yarn
- Docker y Docker Compose

## ⚡ Opción A: Desarrollo Local (Recomendado)

Solo Ollama en Docker, Frontend y Backend locales para desarrollo rápido:

```bash
# 1. Parar servicios anteriores
yarn docker:down-all

# 2. Levantar solo Ollama en Docker
yarn dev:ollama-only

# 3. Esperar a que termine la instalación de modelos (2-3 minutos)
yarn docker:logs

# 4. En otra terminal, levantar Frontend + Backend localmente
yarn dev:local
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Ollama: http://localhost:11434
- Documentación API: http://localhost:3001/api

## 🐳 Opción B: Todo en Docker

Todo en contenedores (más lento para desarrollo):

```bash
# 1. Parar servicios anteriores
yarn docker:down-all

# 2. Levantar todo en Docker
yarn dev:full

# 3. Ver logs
yarn docker:logs
```

## 🔧 Comandos Útiles

```bash
# Verificar estado de contenedores
yarn docker:status

# Ver modelos instalados
yarn docker:models

# Probar conexión con Ollama
yarn docker:test

# Ver logs de Ollama
yarn docker:logs-ollama

# Parar todo
yarn docker:down-all
```

## 🐛 Solución de Problemas

### Error: "connect ECONNREFUSED 127.0.0.1:11434"

1. Verifica que Ollama esté corriendo:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Si estás en desarrollo local, asegúrate de que el backend use `localhost`:
   ```bash
   # En apps/backend/.env
   OLLAMA_URL=http://localhost:11434
   ```

3. Si usas Docker completo, el backend debe usar el nombre del contenedor:
   ```bash
   # En docker-compose.yml
   OLLAMA_URL=http://ollama:11434
   ```

### Reinstalar modelos

```bash
# Eliminar datos de Ollama y empezar de nuevo
docker volume rm expertmind-monorepo_ollama_data
yarn dev:ollama-only
```

## 📝 Configuración del Chat

- **Modelo por defecto**: `tinyllama` (muy rápido, bueno para desarrollo)
- **Modelos alternativos**: `gemma2:2b`, `phi3:mini`
- **Puerto Backend**: 3001
- **Puerto Frontend**: 5173
