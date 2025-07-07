#!/bin/bash

echo "🔧 Configurando permisos de scripts..."

# Hacer ejecutables todos los scripts
chmod +x check-docker.sh
chmod +x scripts/docker-common.sh
chmod +x scripts/docker-up.sh
chmod +x scripts/docker-down.sh  
chmod +x scripts/docker-logs.sh

# Verificar que se aplicaron los permisos
echo "✅ Permisos configurados:"
ls -la check-docker.sh
ls -la scripts/*.sh

echo ""
echo "🎉 Scripts listos para usar!"
echo ""
echo "💡 Comandos disponibles:"
echo "   yarn docker:check    - Verificar instalación Docker"
echo "   yarn docker:up       - Levantar servicios"
echo "   yarn docker:down     - Detener servicios"  
echo "   yarn docker:logs     - Ver logs"
