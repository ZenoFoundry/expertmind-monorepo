# ===============================
# STAGE 1: Build
# ===============================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Instalar TODAS las dependencias (incluyendo dev)
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY apps/backend ./apps/backend

# Cambiar al directorio del backend y construir
WORKDIR /app/apps/backend
RUN yarn build

# ===============================
# STAGE 2: Production
# ===============================
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Instalar SOLO dependencias de producción
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copiar el build desde el stage anterior
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Cambiar al directorio del backend
WORKDIR /app/apps/backend

# Cambiar ownership de archivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Comando para iniciar (usar el mismo comando que funciona)
CMD ["yarn", "start:prod"]