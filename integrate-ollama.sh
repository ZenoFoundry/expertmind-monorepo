#!/bin/bash

# Script para integrar Ollama API en el frontend
# Ejecutar desde el directorio root del proyecto

echo "🚀 Integrando Ollama API en el frontend..."

# Directorio del frontend
FRONTEND_DIR="apps/frontend/src"

# Verificar que estemos en el directorio correcto
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: No se encontró el directorio del frontend"
    echo "   Ejecuta este script desde el directorio root del proyecto"
    exit 1
fi

echo "📂 Directorio del frontend encontrado: $FRONTEND_DIR"

# Crear backup de archivos originales
echo "💾 Creando backup de archivos originales..."
if [ -f "$FRONTEND_DIR/App.tsx" ]; then
    cp "$FRONTEND_DIR/App.tsx" "$FRONTEND_DIR/App-original.tsx"
    echo "   ✅ Backup creado: App-original.tsx"
fi

if [ -f "$FRONTEND_DIR/components/ConfigPanel.tsx" ]; then
    cp "$FRONTEND_DIR/components/ConfigPanel.tsx" "$FRONTEND_DIR/components/ConfigPanel-original.tsx"
    echo "   ✅ Backup creado: ConfigPanel-original.tsx"
fi

# Aplicar archivos optimizados para Ollama
echo "🔧 Aplicando configuración de Ollama..."

if [ -f "$FRONTEND_DIR/App-ollama.tsx" ]; then
    cp "$FRONTEND_DIR/App-ollama.tsx" "$FRONTEND_DIR/App.tsx"
    echo "   ✅ App.tsx actualizado para Ollama"
else
    echo "   ⚠️  Warning: App-ollama.tsx no encontrado"
fi

if [ -f "$FRONTEND_DIR/components/ConfigPanel-ollama.tsx" ]; then
    cp "$FRONTEND_DIR/components/ConfigPanel-ollama.tsx" "$FRONTEND_DIR/components/ConfigPanel.tsx"
    echo "   ✅ ConfigPanel.tsx actualizado para Ollama"
else
    echo "   ⚠️  Warning: ConfigPanel-ollama.tsx no encontrado"
fi

# Verificar que ollama-api.ts existe
if [ -f "$FRONTEND_DIR/utils/ollama-api.ts" ]; then
    echo "   ✅ OllamaApiManager disponible"
else
    echo "   ❌ Error: ollama-api.ts no encontrado"
fi

echo ""
echo "🎉 Integración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Asegúrate de que el backend esté corriendo en puerto 3001"
echo "   2. Ejecuta el frontend: yarn dev:frontend"
echo "   3. Abre la configuración y selecciona preset 'Local Development'"
echo "   4. Prueba la conexión con el botón 'Test Connection'"
echo ""
echo "🔄 Para revertir los cambios:"
echo "   cp $FRONTEND_DIR/App-original.tsx $FRONTEND_DIR/App.tsx"
echo "   cp $FRONTEND_DIR/components/ConfigPanel-original.tsx $FRONTEND_DIR/components/ConfigPanel.tsx"
echo ""
echo "🧪 Para probar la API manualmente:"
echo "   curl -X POST http://localhost:3001/ollama/chat \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"model\":\"tinyllama\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello!\"}]}'"
