# Dockerfile para el backend de ExpertMind
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

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
