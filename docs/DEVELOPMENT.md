# 👨‍💻 Guía de Configuración para Desarrolladores

## 🛠️ Configuración de Entorno de Desarrollo

### IDE y Extensiones Recomendadas

#### Visual Studio Code
```bash
# Extensiones esenciales
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-azuretools.vscode-docker
```

### Variables de Entorno por Módulo

#### Frontend (`apps/frontend/.env`)
```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_OLLAMA_URL=http://localhost:11434

# Development
VITE_PORT=5173
VITE_HOST=localhost

# Feature Flags
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_VOICE_INPUT=false
VITE_ENABLE_DEBUG=true
VITE_USE_UNIFIED_APP=true

# Logging
VITE_LOG_LEVEL=debug
```

#### Backend (`apps/backend/.env`)
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_TIMEOUT=30000

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_CREDENTIALS=true

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# Health Check
HEALTH_CHECK_TIMEOUT=5000
```

## 🧪 Testing y Calidad de Código

### Comandos de Testing

```bash
# Tests completos
yarn test                           # Todos los tests
yarn test:watch                     # Tests en modo watch
yarn test:coverage                  # Tests con coverage
yarn test:e2e                       # Tests end-to-end

# Tests específicos por módulo
yarn workspace @expertmind/frontend test
yarn workspace @expertmind/backend test

# Tests con filtros
yarn test --testNamePattern="Chat"  # Solo tests que contengan "Chat"
yarn test src/components/           # Solo tests en directorio específico
yarn test --bail                    # Parar en el primer fallo
```

## 🔍 Debugging y Desarrollo

### Debug del Backend (NestJS)

#### VS Code Launch Configuration (`.vscode/launch.json`)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/backend/src/main.ts",
      "preLaunchTask": "npm: start:debug",
      "outFiles": ["${workspaceFolder}/apps/backend/dist/**/*.js"],
      "envFile": "${workspaceFolder}/apps/backend/.env",
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Debug Frontend", 
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/frontend/node_modules/.bin/vite",
      "args": ["--debug"],
      "envFile": "${workspaceFolder}/apps/frontend/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

## 📊 Monitoreo y Observabilidad

### Health Checks

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
    };
  }

  @Get('ollama')
  async checkOllama() {
    try {
      const response = await axios.get(`${process.env.OLLAMA_URL}/api/tags`);
      return {
        status: 'connected',
        models: response.data.models?.length || 0,
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
      };
    }
  }
}
```

## 🚀 Optimización y Performance

### Bundle Analyzer

```bash
# Analizar bundle del frontend
yarn workspace @expertmind/frontend build
npx vite-bundle-analyzer apps/frontend/dist

# Ver dependencias más pesadas
yarn workspace @expertmind/frontend analyze
```

## 🔐 Seguridad y Mejores Prácticas

### Environment Variables Security

```bash
# .env.example (plantilla sin valores reales)
NODE_ENV=development
PORT=3001
OLLAMA_URL=http://localhost:11434
JWT_SECRET=change-this-in-production
CORS_ORIGIN=http://localhost:5173

# .gitignore (asegurar que .env no se commit)
.env
.env.local
.env.production
*.env.backup
```

## 🛡️ Troubleshooting Avanzado

### Memory Leak Detection

```bash
# Monitorear memoria
node --inspect --max-old-space-size=4096 dist/main.js

# Usar Chrome DevTools > Memory tab
# Buscar heap snapshots y comparar
```

### Network Debugging

```bash
# Interceptar requests HTTP
export DEBUG=axios
yarn dev:backend

# Monitor de red en tiempo real
netstat -tuln | grep :3001
tcpdump -i lo0 port 3001
```

### Docker Debugging

```bash
# Entrar a contenedor
docker exec -it expertmind-backend /bin/sh
docker exec -it expertmind-ollama /bin/bash

# Ver logs detallados
docker logs expertmind-backend --tail=100 -f
docker logs expertmind-ollama --tail=100 -f

# Verificar recursos
docker stats expertmind-backend
docker inspect expertmind-backend

# Debug de networking
docker network ls
docker network inspect expertmind_default
```

## 📚 Recursos y Referencias

### Documentación Oficial
- [React Documentation](https://react.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Ollama Documentation](https://ollama.ai/docs)

### Herramientas de Desarrollo
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Best Practices
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/security)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
