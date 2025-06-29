# 🚀 ExpertMind - Aplicación Web de Chatbox con IA

Aplicación web moderna desarrollada como monorepo con React (frontend) y NestJS (backend), integrada con Ollama para capacidades de inteligencia artificial.

## 🏗️ Arquitectura

- **Frontend:** React + TypeScript + Vite
- **Backend:** NestJS + TypeScript
- **IA:** Ollama con TinyLlama
- **Contenedores:** Docker + Docker Compose
- **Gestión:** Yarn Workspaces

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **Yarn** (gestor de paquetes)
- **Docker** y **Docker Compose** (para desarrollo con contenedores)

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd expertmind-monorepo

# Instalar dependencias
yarn install

# Levantar todos los servicios
yarn dev

# Esperar a que descargue TinyLlama (unos minutos la primera vez)
yarn docker:logs:ollama
```

**URLs disponibles:**
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:3001
- 📚 Documentación API: http://localhost:3001/api
- 🤖 Ollama: http://localhost:11434

### Opción 2: Desarrollo Local

```bash
# Instalar dependencias
yarn install

# En una terminal: iniciar backend
yarn dev:backend

# En otra terminal: iniciar frontend
yarn dev:frontend

# Nota: Necesitarás Ollama corriendo por separado
```

## 🛠️ Scripts Disponibles

### Scripts Principales
| Comando | Descripción |
|---------|-------------|
| `yarn dev` | Levanta todos los servicios con Docker |
| `yarn dev:local` | Desarrollo local (frontend + backend) |
| `yarn build` | Construye todos los workspaces |
| `yarn test` | Ejecuta pruebas en todos los workspaces |
| `yarn clean` | Limpia archivos generados |

### Scripts de Docker
| Comando | Descripción |
|---------|-------------|
| `yarn docker:up` | Levanta contenedores |
| `yarn docker:down` | Detiene contenedores |
| `yarn docker:logs` | Logs de todos los servicios |
| `yarn docker:logs:backend` | Logs solo del backend |
| `yarn docker:logs:ollama` | Logs solo de Ollama |

### Scripts por Workspace
| Comando | Descripción |
|---------|-------------|
| `yarn dev:frontend` | Solo frontend |
| `yarn dev:backend` | Solo backend |
| `yarn build:frontend` | Build frontend |
| `yarn build:backend` | Build backend |

## 📁 Estructura del Proyecto

```
expertmind-monorepo/
├── apps/
│   ├── frontend/         # React + TypeScript + Vite
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── backend/          # NestJS + TypeScript
│       ├── src/
│       │   ├── ollama/   # Módulo Ollama
│       │   └── main.ts
│       ├── package.json
│       └── Dockerfile
├── docker-compose.yml    # Configuración completa
├── package.json          # Workspace root
└── README.md            # Este archivo
```

## 🤖 API de Ollama

### Endpoints Principales

```bash
# Estado de la API
curl http://localhost:3001/health

# Modelos disponibles
curl http://localhost:3001/ollama/models

# Chat con IA
curl -X POST http://localhost:3001/ollama/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tinyllama",
    "messages": [{"role": "user", "content": "Hola!"}]
  }'

# Generar respuesta
curl -X POST http://localhost:3001/ollama/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tinyllama",
    "prompt": "Explica qué es JavaScript"
  }'
```

## 🐳 Docker

### Comandos Útiles

```bash
# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Entrar a un contenedor
docker-compose exec backend bash
docker-compose exec ollama bash

# Limpiar todo
docker-compose down -v --remove-orphans
docker system prune -a
```

### Servicios Incluidos

- **frontend** - React app en puerto 5173
- **backend** - NestJS API en puerto 3001  
- **ollama** - Servidor Ollama en puerto 11434
- **ollama-setup** - Descarga automática de TinyLlama

## 🔧 Configuración

### Variables de Entorno

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
OLLAMA_URL=http://localhost:11434
```

## 🧪 Testing

```bash
# Todas las pruebas
yarn test

# Solo frontend
yarn workspace @expertmind/frontend test

# Solo backend
yarn workspace @expertmind/backend test

# Probar conexión con Ollama
./apps/backend/scripts/test-ollama.sh
```

## 📚 Documentación

- **API Backend:** http://localhost:3001/api (Swagger)
- **Frontend:** Ver `apps/frontend/README.md`
- **Backend:** Ver `apps/backend/README.md`

## 🚨 Troubleshooting

### Ollama no responde
```bash
# Verificar estado
curl http://localhost:11434/api/tags

# Revisar logs
yarn docker:logs:ollama

# Reiniciar servicio
docker-compose restart ollama
```

### Puerto en uso
```bash
# Cambiar puertos en docker-compose.yml
# O detener otros servicios
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Problemas de build
```bash
# Limpiar y rebuildar
yarn clean
yarn install
docker-compose down -v
docker-compose build --no-cache
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

---

¡Tu aplicación web con IA está lista para usar! 🎉
