#!/bin/bash

# Script inteligente para detectar y usar Docker Compose
# Funciona con docker-compose (clásico) y docker compose (moderno)

# Función para detectar comando Docker Compose disponible
detect_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    elif docker compose version &> /dev/null 2>&1; then
        echo "docker compose"
    else
        echo ""
    fi
}

# Función para verificar Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker no está instalado."
        echo "📥 Instala Docker desde: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo "❌ Error: Docker daemon no está corriendo."
        echo "🚀 Inicia Docker Desktop o ejecuta: sudo systemctl start docker"
        exit 1
    fi
}

# Función para obtener comando Docker Compose
get_docker_compose_cmd() {
    local cmd=$(detect_docker_compose)
    if [ -z "$cmd" ]; then
        echo "❌ Error: Docker Compose no está disponible."
        echo ""
        echo "📥 Opciones de instalación:"
        echo "  1. Docker Desktop (incluye Docker Compose): https://docs.docker.com/get-docker/"
        echo "  2. Docker Compose standalone: https://docs.docker.com/compose/install/"
        echo "  3. Si usas Docker Desktop moderno, prueba: docker compose version"
        exit 1
    fi
    echo "$cmd"
}

# Exportar funciones para otros scripts
export -f detect_docker_compose
export -f check_docker  
export -f get_docker_compose_cmd
