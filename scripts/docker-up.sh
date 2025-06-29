#!/bin/bash

# Script para levantar servicios Docker
source "$(dirname "$0")/docker-common.sh"

echo "🚀 Iniciando servicios ExpertMind..."

# Verificar Docker
check_docker

# Obtener comando Docker Compose
DOCKER_COMPOSE_CMD=$(get_docker_compose_cmd)

echo "✅ Usando: $DOCKER_COMPOSE_CMD"
echo ""

# Ejecutar docker compose up
echo "📦 Levantando servicios..."
$DOCKER_COMPOSE_CMD up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Servicios iniciados exitosamente!"
    echo ""
    echo "🔗 URLs disponibles:"
    echo "   • Frontend:      http://localhost:5173"
    echo "   • Backend API:   http://localhost:3001"
    echo "   • Documentación: http://localhost:3001/api"
    echo "   • Ollama:        http://localhost:11434"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   • Ver logs:      yarn docker:logs"
    echo "   • Ver logs Ollama: yarn docker:logs:ollama"
    echo "   • Detener:       yarn docker:down"
    echo ""
    echo "⏳ Nota: TinyLlama puede tardar unos minutos en descargarse la primera vez."
else
    echo ""
    echo "❌ Error al iniciar servicios."
    echo "💡 Prueba: yarn docker:logs para ver detalles del error."
    exit 1
fi
