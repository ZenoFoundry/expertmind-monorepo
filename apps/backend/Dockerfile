# Dockerfile para el backend de ExpertMind (Monorepo)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias del monorepo
COPY package.json ./
COPY yarn.lock ./

# Copiar package.json del backend
COPY apps/backend/package.json ./apps/backend/

# Instalar dependencias de todo el monorepo
RUN yarn install --frozen-lockfile

# Copiar código fuente del backend
COPY apps/backend ./apps/backend

# Ir al directorio del backend
WORKDIR /app/apps/backend

# Construir la aplicación
RUN yarn build

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001
ENV OLLAMA_URL=http://ollama:11434

# Comando para iniciar la aplicación
CMD ["yarn", "start:prod"]
