#!/bin/bash

# Script para detener servicios Docker
source "$(dirname "$0")/docker-common.sh"

echo "🛑 Deteniendo servicios ExpertMind..."

# Verificar Docker
check_docker

# Obtener comando Docker Compose
DOCKER_COMPOSE_CMD=$(get_docker_compose_cmd)

echo "✅ Usando: $DOCKER_COMPOSE_CMD"
echo ""

# Ejecutar docker compose down
echo "📦 Deteniendo servicios..."
$DOCKER_COMPOSE_CMD down

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Servicios detenidos exitosamente!"
    echo ""
    echo "💡 Para reiniciar: yarn docker:up"
    echo "🗑️  Para limpiar volúmenes: $DOCKER_COMPOSE_CMD down -v"
else
    echo ""
    echo "❌ Error al detener servicios."
    exit 1
fi
