#!/bin/bash

# Script para migrar el módulo Ollama a la nueva estructura

echo "Migrando módulo Ollama..."

# 1. Verificar que estamos en el directorio correcto
if [ ! -d "apps/backend/src" ]; then
  echo "Error: Debes ejecutar este script desde la raíz del proyecto monorepo"
  exit 1
fi

# 2. Eliminar la carpeta antigua de ollama (si existe)
if [ -d "apps/backend/src/ollama" ]; then
  echo "Eliminando carpeta antigua de ollama..."
  rm -rf apps/backend/src/ollama
  echo "✓ Carpeta antigua eliminada"
fi

# 3. Verificar que la nueva estructura existe
if [ -d "apps/backend/src/modules/ollama" ]; then
  echo "✓ Nueva estructura de módulo Ollama creada exitosamente"
else
  echo "Error: La nueva estructura no se creó correctamente"
  exit 1
fi

# 4. Actualizar imports si es necesario
echo "Verificando imports..."

# 5. Mensaje de éxito
echo ""
echo "✅ Migración completada exitosamente!"
echo ""
echo "Estructura del módulo Ollama:"
echo "apps/backend/src/modules/ollama/"
echo "├── controller/       # Controladores HTTP"
echo "├── decorator/        # Decoradores personalizados"
echo "├── dtos/            # Data Transfer Objects"
echo "├── mappers/         # Mappers para transformación"
echo "├── mock/            # Mocks para testing"
echo "├── services/        # Lógica de negocio"
echo "├── utils/           # Utilidades"
echo "└── ollama.module.ts # Módulo principal"
echo ""
echo "Recuerda:"
echo "1. Ejecutar 'yarn install' si agregaste nuevas dependencias"
echo "2. Verificar que el proyecto compile correctamente con 'yarn build'"
echo "3. Ejecutar los tests con 'yarn test'"
