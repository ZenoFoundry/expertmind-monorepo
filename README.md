# Expertmind Monorepo

Aplicación de escritorio desarrollada con React y Electron, estructurada como monorepo.

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **Yarn** (gestor de paquetes)
- **Docker** y **Docker Compose** (para desarrollo con contenedores)

## 🚀 Instalación y Configuración

### Desarrollo Local

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-proyecto>
   ```

2. **Instalar dependencias**
   ```bash
   yarn install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   yarn dev:local
   ```

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `yarn dev` | Ejecuta contenedores Docker en modo desarrollo |
| `yarn dev:frontend` | Inicia solo el frontend en modo desarrollo |
| `yarn dev:local` | Inicia la aplicación en modo desarrollo local |
| `yarn build` | Construye todos los workspaces |
| `yarn build:frontend` | Construye solo el frontend |
| `yarn test` | Ejecuta las pruebas en todos los workspaces |
| `yarn lint` | Analiza el código con ESLint en todos los workspaces |
| `yarn clean` | Limpia node_modules y archivos build |
| `yarn docker:up` | Levanta contenedores Docker en background |
| `yarn docker:down` | Detiene y elimina contenedores Docker |
| `yarn docker:logs` | Muestra logs de contenedores en tiempo real |

## 📁 Estructura del Proyecto

```
├── apps/
│   └── frontend/         # Workspace @expertmind/frontend (React)
├── docker-compose.yml    # Configuración Docker
├── package.json          # Dependencias del workspace root
└── README.md            # Este archivo
```

## 🐳 Docker

```
# Solo hacer build (sin levantar)
`docker-compose build

# Solo levantar (usa imagen existente)
`docker-compose up -d

# Forzar rebuild completo
docker-compose build --no-cache
docker-compose up -d

# Bajar, limpiar y rebuildar todo
docker-compose down
docker-compose up --build -d --force-recreate
```