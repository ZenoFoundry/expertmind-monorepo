#!/bin/bash

echo "🔍 Diagnóstico ExpertMind"
echo "=========================="

# Verificar Docker
echo "1. Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
else
    echo "✅ Docker está disponible"
fi

# Verificar contenedores
echo ""
echo "2. Verificando contenedores..."
if docker ps | grep -q "expertmind-ollama"; then
    echo "✅ Ollama está corriendo"
    
    # Verificar API de Ollama
    echo ""
    echo "3. Verificando API de Ollama..."
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "✅ Ollama API responde"
        
        # Mostrar modelos
        echo ""
        echo "4. Modelos instalados:"
        curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read model; do
            echo "  📦 $model"
        done
        
        # Verificar tinyllama específicamente
        if curl -s http://localhost:11434/api/tags | grep -q "tinyllama"; then
            echo "✅ TinyLlama está instalado"
        else
            echo "⚠️  TinyLlama no está instalado"
            echo "   Ejecuta: yarn docker:pull-tinyllama"
        fi
        
    else
        echo "❌ Ollama API no responde"
        echo "   Verifica: docker logs expertmind-ollama"
    fi
    
else
    echo "❌ Ollama no está corriendo"
    echo "   Ejecuta: yarn dev:ollama-only"
fi

# Verificar puertos
echo ""
echo "5. Verificando puertos..."

if lsof -i :5173 > /dev/null 2>&1; then
    echo "✅ Puerto 5173 (Frontend) está en uso"
else
    echo "⚠️  Puerto 5173 (Frontend) libre"
fi

if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Puerto 3001 (Backend) está en uso"
else
    echo "⚠️  Puerto 3001 (Backend) libre"
fi

if lsof -i :11434 > /dev/null 2>&1; then
    echo "✅ Puerto 11434 (Ollama) está en uso"
else
    echo "❌ Puerto 11434 (Ollama) libre"
fi

echo ""
echo "📋 Próximos pasos:"
echo "==================="

if ! docker ps | grep -q "expertmind-ollama"; then
    echo "1. Levantar Ollama: yarn dev:ollama-only"
    echo "2. Esperar instalación: yarn docker:logs"
    echo "3. Levantar desarrollo: yarn dev:local"
else
    if ! lsof -i :3001 > /dev/null 2>&1 || ! lsof -i :5173 > /dev/null 2>&1; then
        echo "1. Levantar desarrollo: yarn dev:local"
    else
        echo "🎉 Todo está corriendo correctamente!"
        echo "📱 Frontend: http://localhost:5173"
        echo "🔧 Backend: http://localhost:3001"
        echo "🤖 Ollama: http://localhost:11434"
    fi
fi

echo ""
echo "🆘 Si tienes problemas:"
echo "   - Lee: DESARROLLO.md"
echo "   - Logs: yarn docker:logs"
echo "   - Reset: yarn docker:down-all"
