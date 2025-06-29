#!/bin/bash

# Script para ver logs de servicios Docker
source "$(dirname "$0")/docker-common.sh"

SERVICE=$1

# Verificar Docker
check_docker

# Obtener comando Docker Compose
DOCKER_COMPOSE_CMD=$(get_docker_compose_cmd)

if [ -z "$SERVICE" ]; then
    echo "📋 Mostrando logs de todos los servicios..."
    echo "💡 Usa Ctrl+C para salir"
    echo ""
    $DOCKER_COMPOSE_CMD logs -f
else
    echo "📋 Mostrando logs del servicio: $SERVICE"
    echo "💡 Usa Ctrl+C para salir"
    echo ""
    $DOCKER_COMPOSE_CMD logs -f "$SERVICE"
fi
