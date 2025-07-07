#!/bin/bash

echo "🔍 Verificando instalación de Docker y Docker Compose..."
echo "=================================================="

# Verificar Docker
echo ""
echo "1. Verificando Docker:"
if command -v docker &> /dev/null; then
    echo "✅ Docker está instalado:"
    docker --version
else
    echo "❌ Docker NO está instalado"
fi

# Verificar Docker Compose (versión antigua)
echo ""
echo "2. Verificando docker-compose (comando clásico):"
if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose está disponible:"
    docker-compose --version
else
    echo "❌ docker-compose NO está disponible"
fi

# Verificar Docker Compose (versión nueva)
echo ""
echo "3. Verificando docker compose (comando moderno):"
if docker compose version &> /dev/null 2>&1; then
    echo "✅ docker compose está disponible:"
    docker compose version
else
    echo "❌ docker compose NO está disponible"
fi

# Verificar si Docker está corriendo
echo ""
echo "4. Verificando si Docker daemon está corriendo:"
if docker info &> /dev/null; then
    echo "✅ Docker daemon está corriendo"
else
    echo "❌ Docker daemon NO está corriendo o no tienes permisos"
fi

echo ""
echo "=================================================="
echo "Diagnóstico completado."
