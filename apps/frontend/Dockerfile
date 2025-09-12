# Dockerfile para el frontend (contexto: /apps/frontend/)
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias del frontend
COPY package.json ./
COPY yarn.lock* ./

# Instalar dependencias
RUN yarn install --frozen-lockfile --ignore-platform

# Copiar archivos de configuración explícitamente UNO POR UNO
COPY vite.config.ts ./vite.config.ts
COPY tsconfig.json ./tsconfig.json  
COPY tsconfig.node.json ./tsconfig.node.json
COPY index.html ./index.html

# Copiar directorios necesarios
COPY src/ ./src/
COPY public/ ./public/

# DEBUG: Verificar que ESPECÍFICAMENTE vite.config.ts existe
RUN echo "=== VERIFICANDO vite.config.ts ===" && \
    ls -la vite.config.ts && \
    echo "=== CONTENIDO DEL DIRECTORIO ===" && \
    ls -la && \
    echo "=== ARCHIVOS .ts ENCONTRADOS ===" && \
    find . -name "*.ts" | head -5

# Exponer puerto de Vite
EXPOSE 5173

# Variables de entorno
ENV NODE_ENV=development
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# Comando para iniciar la aplicación
CMD ["yarn", "dev", "--host", "0.0.0.0"]