#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Iconos
CHECK_MARK="✅"
CROSS_MARK="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"
ROCKET="🚀"

echo -e "${BLUE}🔍 Diagnóstico Completo ExpertMind${NC}"
echo "=========================================="
echo ""

# Variables para tracking
ERRORS=0
WARNINGS=0
DOCKER_RUNNING=false
OLLAMA_RUNNING=false
BACKEND_RUNNING=false
FRONTEND_RUNNING=false

# Función para logging
log_success() {
    echo -e "${GREEN}${CHECK_MARK} $1${NC}"
}

log_error() {
    echo -e "${RED}${CROSS_MARK} $1${NC}"
    ((ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
    ((WARNINGS++))
}

log_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

log_section() {
    echo ""
    echo -e "${PURPLE}$1${NC}"
    echo "----------------------------------------"
}

# 1. Verificar herramientas base
log_section "1. ${GEAR} Verificando Herramientas Base"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        log_success "Node.js $NODE_VERSION (✓ >= 18.0.0)"
    else
        log_error "Node.js $NODE_VERSION (necesita >= 18.0.0)"
    fi
else
    log_error "Node.js no está instalado"
    echo "   Instalar desde: https://nodejs.org/"
fi

# Yarn
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    log_success "Yarn $YARN_VERSION"
else
    log_error "Yarn no está instalado"
    echo "   Instalar con: npm install -g yarn"
fi

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
    log_success "Docker $DOCKER_VERSION"
    
    # Verificar si Docker daemon está corriendo
    if docker info &> /dev/null; then
        log_success "Docker daemon está corriendo"
        DOCKER_RUNNING=true
    else
        log_error "Docker daemon no está corriendo"
        echo "   Iniciar Docker Desktop o ejecutar: sudo systemctl start docker"
    fi
else
    log_error "Docker no está instalado"
    echo "   Instalar desde: https://docs.docker.com/get-docker/"
fi

# Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version --short)
        log_success "Docker Compose $COMPOSE_VERSION"
    else
        COMPOSE_VERSION=$(docker-compose --version | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
        log_success "Docker Compose $COMPOSE_VERSION (legacy)"
    fi
else
    log_error "Docker Compose no está disponible"
fi

# 2. Verificar recursos del sistema
log_section "2. 💻 Verificando Recursos del Sistema"

# Memoria
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -h | awk '/^Mem:/ {print $2}')
    AVAILABLE_MEM=$(free -h | awk '/^Mem:/ {print $7}')
    log_info "Memoria total: $TOTAL_MEM, disponible: $AVAILABLE_MEM"
    
    # Verificar si hay al menos 4GB disponibles
    AVAILABLE_GB=$(free -g | awk '/^Mem:/ {print $7}')
    if [ "$AVAILABLE_GB" -ge 4 ]; then
        log_success "Memoria suficiente para Ollama (${AVAILABLE_GB}GB disponible)"
    else
        log_warning "Memoria baja para Ollama (${AVAILABLE_GB}GB disponible, recomendado: 4GB+)"
    fi
elif command -v vm_stat &> /dev/null; then
    # macOS
    FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    FREE_GB=$((FREE_PAGES * 4096 / 1024 / 1024 / 1024))
    log_info "Memoria disponible: ${FREE_GB}GB (macOS)"
    
    if [ "$FREE_GB" -ge 4 ]; then
        log_success "Memoria suficiente para Ollama"
    else
        log_warning "Memoria baja para Ollama (${FREE_GB}GB disponible)"
    fi
fi

# Espacio en disco
DISK_USAGE=$(df -h . | awk 'NR==2 {print $4}')
log_info "Espacio disponible: $DISK_USAGE"

# 3. Verificar configuración de Docker
if [ "$DOCKER_RUNNING" = true ]; then
    log_section "3. 🐳 Verificando Configuración Docker"
    
    # Verificar límites de Docker
    DOCKER_MEM=$(docker system info 2>/dev/null | grep "Total Memory" | awk '{print $3$4}')
    if [ ! -z "$DOCKER_MEM" ]; then
        log_info "Memoria asignada a Docker: $DOCKER_MEM"
    fi
    
    # Verificar contenedores de ExpertMind
    if docker ps | grep -q "expertmind-ollama"; then
        log_success "Contenedor Ollama está corriendo"
        OLLAMA_RUNNING=true
    else
        log_warning "Contenedor Ollama no está corriendo"
    fi
    
    if docker ps | grep -q "expertmind-backend"; then
        log_success "Contenedor Backend está corriendo"
        BACKEND_RUNNING=true
    else
        log_info "Contenedor Backend no está corriendo (normal en desarrollo local)"
    fi
    
    # Verificar volúmenes
    if docker volume ls | grep -q "ollama_data"; then
        VOLUME_SIZE=$(docker system df -v | grep ollama_data | awk '{print $3}')
        log_success "Volumen ollama_data existe (tamaño: $VOLUME_SIZE)"
    else
        log_info "Volumen ollama_data no existe (se creará automáticamente)"
    fi
fi

# 4. Verificar conectividad de servicios
log_section "4. 🌐 Verificando Conectividad de Servicios"

# Verificar puertos
check_port() {
    local port=$1
    local service=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        log_success "Puerto $port ($service) está en uso"
        return 0
    else
        log_info "Puerto $port ($service) está libre"
        return 1
    fi
}

# Frontend (5173)
if check_port 5173 "Frontend"; then
    FRONTEND_RUNNING=true
    # Verificar si responde HTTP
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        log_success "Frontend responde en http://localhost:5173"
    else
        log_warning "Puerto 5173 ocupado pero no responde HTTP"
    fi
fi

# Backend (3001)
if check_port 3001 "Backend"; then
    BACKEND_RUNNING=true
    # Verificar health endpoint
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Backend responde en http://localhost:3001/health"
        
        # Verificar respuesta JSON
        HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
        if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
            log_success "Backend health check exitoso"
        else
            log_warning "Backend responde pero health check falló"
        fi
    else
        log_warning "Puerto 3001 ocupado pero backend no responde"
    fi
fi

# Ollama (11434)
if check_port 11434 "Ollama"; then
    OLLAMA_RUNNING=true
    # Verificar API de Ollama
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        log_success "Ollama API responde en http://localhost:11434"
        
        # Verificar modelos instalados
        MODELS_RESPONSE=$(curl -s http://localhost:11434/api/tags 2>/dev/null)
        if [ $? -eq 0 ] && [ ! -z "$MODELS_RESPONSE" ]; then
            MODELS_COUNT=$(echo "$MODELS_RESPONSE" | grep -o '"name"' | wc -l)
            log_info "Modelos de IA instalados: $MODELS_COUNT"
            
            # Mostrar modelos específicos
            if echo "$MODELS_RESPONSE" | grep -q "tinyllama"; then
                log_success "TinyLlama está instalado ⚡"
            else
                log_warning "TinyLlama no está instalado"
            fi
            
            if echo "$MODELS_RESPONSE" | grep -q "llama2"; then
                log_info "Llama2 está instalado 🧠"
            fi
            
            if echo "$MODELS_RESPONSE" | grep -q "gemma"; then
                log_info "Gemma está instalado 💎"
            fi
        fi
    else
        log_warning "Puerto 11434 ocupado pero Ollama API no responde"
    fi
fi

# 5. Verificar archivos de configuración
log_section "5. 📁 Verificando Archivos de Configuración"

# package.json raíz
if [ -f "package.json" ]; then
    log_success "package.json raíz encontrado"
    
    # Verificar workspaces
    if grep -q "workspaces" package.json; then
        log_success "Configuración de workspaces encontrada"
    else
        log_warning "Configuración de workspaces no encontrada"
    fi
else
    log_error "package.json raíz no encontrado"
fi

# Frontend
if [ -d "apps/frontend" ]; then
    log_success "Directorio frontend encontrado"
    
    if [ -f "apps/frontend/package.json" ]; then
        log_success "package.json del frontend encontrado"
    else
        log_error "package.json del frontend no encontrado"
    fi
    
    if [ -f "apps/frontend/vite.config.ts" ]; then
        log_success "Configuración de Vite encontrada"
    else
        log_warning "vite.config.ts no encontrado"
    fi
else
    log_error "Directorio apps/frontend no encontrado"
fi

# Backend
if [ -d "apps/backend" ]; then
    log_success "Directorio backend encontrado"
    
    if [ -f "apps/backend/package.json" ]; then
        log_success "package.json del backend encontrado"
    else
        log_error "package.json del backend no encontrado"
    fi
    
    if [ -f "apps/backend/nest-cli.json" ]; then
        log_success "Configuración de NestJS encontrada"
    else
        log_warning "nest-cli.json no encontrado"
    fi
else
    log_error "Directorio apps/backend no encontrado"
fi

# Docker compose
if [ -f "docker-compose.yml" ]; then
    log_success "docker-compose.yml encontrado"
else
    log_error "docker-compose.yml no encontrado"
fi

if [ -f "docker-compose.ollama-only.yml" ]; then
    log_success "docker-compose.ollama-only.yml encontrado"
else
    log_warning "docker-compose.ollama-only.yml no encontrado"
fi

# 6. Verificar dependencias
log_section "6. 📦 Verificando Dependencias"

if [ -d "node_modules" ]; then
    log_success "node_modules raíz encontrado"
else
    log_warning "node_modules raíz no encontrado - ejecutar: yarn install"
fi

if [ -d "apps/frontend/node_modules" ]; then
    log_success "node_modules frontend encontrado"
else
    log_warning "node_modules frontend no encontrado"
fi

if [ -d "apps/backend/node_modules" ]; then
    log_success "node_modules backend encontrado"
else
    log_warning "node_modules backend no encontrado"
fi

# 7. Resumen y recomendaciones
log_section "7. 📋 Resumen y Próximos Pasos"

echo ""
echo -e "${BLUE}Estado General:${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}${CHECK_MARK} Todo está perfecto! 🎉${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}${WARNING} Funcional con $WARNINGS advertencias${NC}"
else
    echo -e "${RED}${CROSS_MARK} $ERRORS errores críticos, $WARNINGS advertencias${NC}"
fi

echo ""
echo -e "${PURPLE}Servicios Activos:${NC}"
[ "$FRONTEND_RUNNING" = true ] && echo -e "${GREEN}${CHECK_MARK} Frontend: http://localhost:5173${NC}"
[ "$BACKEND_RUNNING" = true ] && echo -e "${GREEN}${CHECK_MARK} Backend: http://localhost:3001${NC}"
[ "$OLLAMA_RUNNING" = true ] && echo -e "${GREEN}${CHECK_MARK} Ollama: http://localhost:11434${NC}"

echo ""
echo -e "${CYAN}Próximos pasos recomendados:${NC}"

# Recomendaciones basadas en el estado
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}🔧 ERRORES CRÍTICOS - Resolver primero:${NC}"
    
    if ! command -v node &> /dev/null; then
        echo "   1. Instalar Node.js >= 18: https://nodejs.org/"
    fi
    
    if ! command -v yarn &> /dev/null; then
        echo "   2. Instalar Yarn: npm install -g yarn"
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "   3. Instalar Docker: https://docs.docker.com/get-docker/"
    fi
    
    if [ ! -f "package.json" ]; then
        echo "   4. Verificar que estás en el directorio correcto del proyecto"
    fi
elif [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 INSTALAR DEPENDENCIAS:${NC}"
    echo "   1. yarn install"
    echo "   2. yarn dev:ollama-only"
    echo "   3. yarn dev:local"
elif [ "$OLLAMA_RUNNING" = false ]; then
    echo -e "${BLUE}🤖 CONFIGURAR IA:${NC}"
    echo "   1. yarn dev:ollama-only"
    echo "   2. Esperar descarga del modelo (3-5 min): yarn docker:logs"
    echo "   3. yarn dev:local"
elif [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
    echo -e "${GREEN}🚀 INICIAR DESARROLLO:${NC}"
    echo "   1. yarn dev:local (Frontend + Backend local)"
    echo "   O: yarn dev (Todo en Docker)"
else
    echo -e "${GREEN}🎉 TODO FUNCIONANDO CORRECTAMENTE!${NC}"
    echo "   📱 Frontend: http://localhost:5173"
    echo "   🔧 Backend: http://localhost:3001"
    echo "   🤖 Ollama: http://localhost:11434"
    echo "   📚 API Docs: http://localhost:3001/api"
fi

echo ""
echo -e "${CYAN}Comandos útiles:${NC}"
echo "   📊 Estado: yarn docker:status"
echo "   📝 Logs: yarn docker:logs"
echo "   🧪 Test: yarn docker:test"
echo "   🔄 Reiniciar: yarn docker:rebuild"
echo "   🧹 Limpiar: yarn docker:down-all"
echo "   📋 Modelos: yarn docker:models"

echo ""
echo -e "${PURPLE}🆘 Si tienes problemas:${NC}"
echo "   📖 Documentación: README.md"
echo "   🔍 Diagnóstico: yarn diagnostico"
echo "   📞 Soporte: GitHub Issues"

echo ""
echo -e "${BLUE}Diagnóstico completado: $(date)${NC}"

# Exit code basado en errores
if [ $ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi
