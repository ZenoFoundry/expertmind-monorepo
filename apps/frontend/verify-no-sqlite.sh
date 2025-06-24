#!/bin/bash

# Script de verificación - SQLite completamente deshabilitado
echo "🔍 Verificando que SQLite esté completamente deshabilitado..."

# Verificar que sqlite3 no esté en package.json
echo ""
echo "📦 Verificando package.json..."
if grep -q "sqlite3" package.json; then
    echo "❌ ERROR: sqlite3 aún está en package.json"
    exit 1
else
    echo "✅ sqlite3 removido de package.json"
fi

# Verificar que no haya referencias a sqlite en el código fuente
echo ""
echo "🔍 Verificando código fuente..."
SQLITE_REFS=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "sqlite" 2>/dev/null | grep -v database.ts || true)
if [ -n "$SQLITE_REFS" ]; then
    echo "❌ ERROR: Referencias a sqlite encontradas en:"
    echo "$SQLITE_REFS"
    exit 1
else
    echo "✅ No se encontraron referencias a sqlite en el código fuente"
fi

# Verificar que storage-config esté configurado correctamente
echo ""
echo "⚙️ Verificando configuración de almacenamiento..."
if grep -q "type: 'localStorage'" src/utils/storage-config.ts; then
    echo "✅ Configuración correcta: forzando localStorage"
else
    echo "❌ ERROR: Configuración incorrecta en storage-config.ts"
    exit 1
fi

# Verificar que el directorio node_modules/sqlite3 no exista
echo ""
echo "📁 Verificando node_modules..."
if [ -d "node_modules/sqlite3" ]; then
    echo "❌ ERROR: node_modules/sqlite3 aún existe"
    echo "   Ejecuta: yarn remove sqlite3 && yarn install"
    exit 1
else
    echo "✅ sqlite3 removido de node_modules"
fi

echo ""
echo "🎉 ¡Verificación completa! SQLite está completamente deshabilitado."
echo ""
echo "📋 Resumen de cambios:"
echo "   - ✅ Dependencia sqlite3 removida de package.json"
echo "   - ✅ Configuración forzada a localStorage únicamente"
echo "   - ✅ Código SQLite completamente removido"
echo "   - ✅ Paquete sqlite3 desinstalado"
echo ""
echo "🚀 El proyecto ahora usa solo localStorage para almacenamiento."
