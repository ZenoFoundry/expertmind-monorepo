# Dockerfile para el frontend de ExpertMind (Monorepo)
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias del monorepo
COPY package.json ./
COPY yarn.lock ./

# Copiar package.json del frontend
COPY apps/frontend/package.json ./apps/frontend/

# Instalar dependencias de todo el monorepo
RUN yarn install --frozen-lockfile

# Copiar código fuente del frontend
COPY apps/frontend ./apps/frontend

# Ir al directorio del frontend
WORKDIR /app/apps/frontend

# Exponer puerto
EXPOSE 5173

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# Comando para iniciar la aplicación en modo desarrollo
CMD ["yarn", "dev", "--host", "0.0.0.0"]
