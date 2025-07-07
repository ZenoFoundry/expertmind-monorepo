# ExpertMind Backend

Backend desarrollado en NestJS con integración a Ollama para el proyecto ExpertMind.

## 🚀 Características

- API REST desarrollada con NestJS
- Integración completa con Ollama
- Soporte para múltiples modelos de IA
- Documentación automática con Swagger
- Configuración Docker lista para producción
- Validación de datos con class-validator
- Logs estructurados

## 📋 Prerrequisitos

- Node.js 18 o superior
- Yarn
- Docker y Docker Compose (para desarrollo con contenedores)

## 🛠️ Instalación y Configuración

### Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   yarn install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   yarn start:dev
   ```

### Desarrollo con Docker

1. **Desde la raíz del monorepo, ejecutar:**
   ```bash
   yarn docker:up
   ```

   Esto iniciará:
   - Backend en `http://localhost:3001`
   - Ollama en `http://localhost:11434`
   - Frontend en `http://localhost:5173`
   - Descarga automática de TinyLlama

2. **Ver logs:**
   ```bash
   # Todos los servicios
   yarn docker:logs
   
   # Solo backend
   yarn docker:logs:backend
   
   # Solo Ollama
   yarn docker:logs:ollama
   ```

## 📚 API Endpoints

### Estado del Servicio
- `GET /` - Health check básico
- `GET /health` - Estado detallado del servicio
- `GET /api` - Documentación Swagger

### Ollama
- `GET /ollama/models` - Listar modelos disponibles
- `GET /ollama/status` - Estado de conexión con Ollama
- `POST /ollama/chat` - Conversación con un modelo
- `POST /ollama/generate` - Generar respuesta con prompt
- `POST /ollama/pull/:modelName` - Descargar un modelo específico

## 💡 Ejemplos de Uso

### Chat con TinyLlama

```bash
curl -X POST http://localhost:3001/ollama/chat \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"model\": \"tinyllama\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"¿Qué es la inteligencia artificial?\"
      }
    ]
  }'
```

### Generar respuesta simple

```bash
curl -X POST http://localhost:3001/ollama/generate \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"model\": \"tinyllama\",
    \"prompt\": \"Explica brevemente qué es Node.js\"
  }'
```

### Verificar modelos disponibles

```bash
curl http://localhost:3001/ollama/models
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `OLLAMA_URL` | URL de Ollama | `http://localhost:11434` |

### Modelos Soportados

El sistema viene preconfigurado con TinyLlama, pero puedes usar cualquier modelo compatible con Ollama:

- `tinyllama` (incluido por defecto)
- `llama2`
- `codellama`
- `mistral`
- Y muchos más...

## 🧪 Testing

```bash
# Tests unitarios
yarn test

# Tests con coverage
yarn test:cov

# Tests e2e
yarn test:e2e
```

## 📖 Documentación

Una vez que el servidor esté corriendo, la documentación interactiva estará disponible en:
- **Swagger UI:** http://localhost:3001/api

## 🐛 Troubleshooting

### Ollama no se conecta

1. Verificar que Ollama esté corriendo:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Revisar logs de Ollama:
   ```bash
   yarn docker:logs:ollama
   ```

### Modelo no encontrado

1. Listar modelos disponibles:
   ```bash
   curl http://localhost:3001/ollama/models
   ```

2. Descargar un modelo específico:
   ```bash
   curl -X POST http://localhost:3001/ollama/pull/tinyllama
   ```

### Puerto en uso

Si el puerto 3001 está ocupado, puedes cambiarlo en el archivo `.env`:
```env
PORT=3002
```

## 📁 Estructura del Proyecto

```
apps/backend/
├── src/
│   ├── ollama/           # Módulo de Ollama
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── ollama.controller.ts
│   │   ├── ollama.service.ts
│   │   └── ollama.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── .env.example
└── README.md
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
