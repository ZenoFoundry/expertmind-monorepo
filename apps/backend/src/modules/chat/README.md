# 💬 Chat Module

Este módulo proporciona una API completa para la gestión de conversaciones y mensajes de chat con integración de múltiples proveedores de IA.

## 🏗️ Arquitectura

### **Entidades principales:**
- **Conversation**: Gestiona las conversaciones de los usuarios
- **Message**: Administra los mensajes individuales dentro de las conversaciones

### **Servicios:**
- **ChatService**: Servicio principal que orquesta todas las operaciones
- **ConversationService**: CRUD de conversaciones
- **MessageService**: CRUD de mensajes
- **AIProviderService**: Abstracción para múltiples proveedores de IA

### **Características:**
- ✅ Autenticación JWT requerida
- ✅ Gestión completa de conversaciones por usuario
- ✅ Soporte para múltiples proveedores de IA (Ollama, Anthropic, OpenAI)
- ✅ Paginación en todas las consultas
- ✅ Búsqueda de mensajes
- ✅ Estadísticas de conversaciones
- ✅ Validación completa de datos
- ✅ Documentación Swagger automática

## 📡 Endpoints disponibles

### **Conversaciones**
```
POST   /chat/conversations              # Crear conversación
GET    /chat/conversations              # Listar conversaciones (paginado)
GET    /chat/conversations/:id          # Obtener conversación
PUT    /chat/conversations/:id          # Actualizar conversación
DELETE /chat/conversations/:id          # Eliminar conversación
```

### **Mensajes**
```
POST   /chat/conversations/:id/messages # Enviar mensaje
GET    /chat/conversations/:id/messages # Obtener mensajes (paginado)
```

### **Utilidades**
```
GET    /chat/conversations/:id/stats    # Estadísticas de conversación
GET    /chat/conversations/:id/search   # Buscar mensajes
GET    /chat/providers                  # Proveedores de IA disponibles
```

## 🔧 Uso

### **1. Crear una conversación**
```bash
curl -X POST http://localhost:3001/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi chat sobre TypeScript",
    "aiProvider": "agno",
    "model": "llama2",
    "systemPrompt": "Eres un asistente experto en programación.",
    "settings": {
      "temperature": 0.7,
      "maxTokens": 1000
    }
  }'
```

### **2. Enviar un mensaje**
```bash
curl -X POST http://localhost:3001/chat/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "¿Puedes ayudarme con TypeScript?"
  }'
```

### **3. Listar conversaciones**
```bash
curl -X GET "http://localhost:3001/chat/conversations?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔗 Integración con Frontend

Este módulo está diseñado para integrarse perfectamente con el frontend existente mediante la implementación de:

### **Modo Coexistencia:**
- **Usuarios anónimos**: Continúan usando localStorage (modo offline)
- **Usuarios autenticados**: Utilizan el nuevo sistema de backend (modo online)
- **Sincronización**: Posibilidad de migrar datos entre modos

### **Frontend Integration Points:**
1. **Detección de autenticación** para cambiar entre modos
2. **Nuevos servicios de chat** que consuman estos endpoints
3. **Actualización de componentes** para usar el nuevo estado global
4. **Migración gradual** desde localStorage al backend

## 🚀 Próximos Pasos

### **Fase 2: Frontend Integration**
- [ ] Crear servicios de frontend para consumir la API
- [ ] Implementar sistema de coexistencia
- [ ] Actualizar componentes React existentes

### **Fase 3: Features Avanzadas**
- [ ] WebSockets para tiempo real
- [ ] Streaming de respuestas
- [ ] Sistema de archivos adjuntos
- [ ] Base de datos persistente (PostgreSQL/MongoDB)

## 📊 Almacenamiento Actual

Por ahora, el sistema utiliza `Map` en memoria para simular la persistencia. Esto es perfecto para desarrollo y testing, pero en producción debería implementarse con una base de datos real.

## 🔒 Seguridad

- Autenticación JWT obligatoria
- Validación de propiedad de conversaciones
- Sanitización de entrada con class-validator
- Rate limiting preparado para implementación

## 📚 Documentación

La documentación completa está disponible en Swagger:
- **URL**: `http://localhost:3001/api`
- **Tag**: `chat` para todos los endpoints del módulo

---

Este módulo representa la base sólida para un sistema de chat escalable y mantenible que puede crecer con las necesidades del proyecto.
