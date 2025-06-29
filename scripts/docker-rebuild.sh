#!/bin/bash

# Script para limpiar y rebuildar Docker desde cero
source "$(dirname "$0")/docker-common.sh"

echo "🧹 Limpiando y rebuildeando ExpertMind..."

# Verificar Docker
check_docker

# Obtener comando Docker Compose
DOCKER_COMPOSE_CMD=$(get_docker_compose_cmd)

echo "✅ Usando: $DOCKER_COMPOSE_CMD"
echo ""

# Detener servicios si están corriendo
echo "🛑 Deteniendo servicios existentes..."
$DOCKER_COMPOSE_CMD down -v --remove-orphans

# Limpiar imágenes del proyecto
echo "🗑️  Limpiando imágenes del proyecto..."
docker images | grep expertmind | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Limpiar imágenes sin usar
echo "🧽 Limpiando imágenes sin usar..."
docker image prune -f

# Rebuild desde cero
echo "🔨 Rebuildeando desde cero..."
$DOCKER_COMPOSE_CMD build --no-cache --parallel

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Rebuild completado exitosamente!"
    echo ""
    echo "🚀 Iniciando servicios..."
    $DOCKER_COMPOSE_CMD up -d
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 ¡ExpertMind está listo!"
        echo ""
        echo "🔗 URLs disponibles:"
        echo "   • Frontend:      http://localhost:5173"
        echo "   • Backend API:   http://localhost:3001"
        echo "   • Documentación: http://localhost:3001/api"
        echo "   • Ollama:        http://localhost:11434"
        echo ""
        echo "📋 Próximos pasos:"
        echo "   • Ver logs: yarn docker:logs"
        echo "   • Esperar descarga TinyLlama (unos minutos)"
    else
        echo ""
        echo "❌ Error al iniciar servicios después del rebuild."
        echo "💡 Ver logs: yarn docker:logs"
    fi
else
    echo ""
    echo "❌ Error durante el rebuild."
    echo "💡 Verifica las dependencias y configuración."
    exit 1
fi
