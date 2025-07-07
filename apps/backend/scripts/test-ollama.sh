#!/bin/bash

# Script para probar la conexión con Ollama y el backend
# Uso: ./scripts/test-ollama.sh

API_URL="http://localhost:3001"
OLLAMA_URL="http://localhost:11434"

echo "🧪 Probando conexión con ExpertMind Backend..."
echo "================================================"

# Función para hacer peticiones con manejo de errores
make_request() {
    local url=$1
    local method=${2:-GET}
    local data=${3:-}
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -d "$data" \
             -w "\nHTTP Status: %{http_code}\n"
    else
        curl -s -X "$method" "$url" \
             -w "\nHTTP Status: %{http_code}\n"
    fi
}

echo "1. 🏥 Health check del backend..."
make_request "$API_URL/health"
echo ""

echo "2. 🔌 Estado de conexión con Ollama..."
make_request "$API_URL/ollama/status"
echo ""

echo "3. 📋 Modelos disponibles en Ollama..."
make_request "$API_URL/ollama/models"
echo ""

echo "4. 💬 Prueba de chat con TinyLlama..."
chat_data='{
  "model": "tinyllama",
  "messages": [
    {
      "role": "user",
      "content": "Hola, responde brevemente: ¿qué es Node.js?"
    }
  ],
  "options": {
    "temperature": 0.7
  }
}'

make_request "$API_URL/ollama/chat" "POST" "$chat_data"
echo ""

echo "5. 🤖 Prueba de generación simple..."
generate_data='{
  "model": "tinyllama",
  "prompt": "Escribe una oración sobre inteligencia artificial:",
  "options": {
    "temperature": 0.8
  }
}'

make_request "$API_URL/ollama/generate" "POST" "$generate_data"
echo ""

echo "✅ Pruebas completadas!"
echo ""
echo "🔗 Enlaces útiles:"
echo "   • API Health: $API_URL/health"
echo "   • Documentación: $API_URL/api"
echo "   • Ollama API: $OLLAMA_URL/api/tags"
