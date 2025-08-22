# 🚀 Sistema de Chat Unificado - Frontend

## 🎯 **Coexistencia Implementada**

Este sistema permite que **usuarios anónimos** y **usuarios autenticados** coexistan perfectamente:

- **👤 Usuarios anónimos**: Usan localStorage (modo offline)
- **🔐 Usuarios autenticados**: Pueden usar backend/cloud (modo online)
- **🔄 Fallback automático**: Si falla el backend, usa localStorage

## 🏗️ **Arquitectura**

### **Capas del Sistema:**

```
┌─────────────────────────────────────────┐
│             COMPONENTES UI              │
│   AppUnified, ChatAreaUnified, etc.    │
├─────────────────────────────────────────┤
│              HOOKS REACT                │
│      useChatState, useChatMode          │
├─────────────────────────────────────────┤
│           SERVICIO UNIFICADO            │
│         unifiedChatService              │
├─────────────────────────────────────────┤
│        SERVICIOS ESPECÍFICOS            │
│  backendChatService  │  dbManager       │
│     (backend)        │ (localStorage)   │
└─────────────────────────────────────────┘
```

## 🎮 **Cómo Usar**

### **1. Desarrollo - Cambiar entre versiones**

En desarrollo, puedes cambiar entre la app legacy y la unificada:

```bash
# Usar app unificada
localStorage.setItem('em-use-unified-app', 'true')

# O agregar query param
http://localhost:5173?unified=true

# O variable de entorno
VITE_USE_UNIFIED_APP=true
```

### **2. Hook Principal**

```typescript
import { useChatState } from './hooks/chat';

function MyComponent() {
  const {
    // Estado
    conversations,
    activeConversation,
    messages,
    mode, // 'online' | 'offline'
    isLoading,
    
    // Acciones
    createConversation,
    selectConversation,
    sendMessage,
    
    // Utilidades
    switchToOnlineMode,
    getStatusInfo
  } = useChatState();

  // El componente no sabe si usa localStorage o backend! 🎉
}
```

### **3. Indicador de Modo**

```typescript
import { ChatModeIndicator } from './components';

function Header() {
  return (
    <ChatModeIndicator 
      compact={true}
      showSwitcher={true}
      onSwitchMode={(mode) => console.log('Switched to', mode)}
    />
  );
}
```

## 🔧 **Componentes Disponibles**

### **Nuevos Componentes Unificados:**

- **`AppUnified`**: App principal con sistema unificado
- **`ChatAreaUnified`**: Área de chat que muestra origen de datos
- **`SidebarUnified`**: Sidebar que agrupa conversaciones por fuente
- **`ChatModeIndicator`**: Indicador de modo actual
- **`ChatModeConfig`**: Configuración avanzada del sistema

### **Hooks Especializados:**

- **`useChatState`**: Hook principal para todo el estado
- **`useChatMode`**: Detección de modo y capacidades
- **`useOptimisticMessages`**: Mensajes optimistas
- **`useChatPersistence`**: Persistencia y backup

## 📊 **Estados del Sistema**

### **Modos de Operación:**

```typescript
type ChatMode = 'online' | 'offline';

// Online: Usuario autenticado + conexión + backend disponible
// Offline: Usuario anónimo o sin conexión o backend no disponible
```

### **Detección Automática:**

```typescript
const mode = useChatMode();

// Detecta automáticamente:
// ✅ Estado de autenticación
// ✅ Conexión de red
// ✅ Disponibilidad del backend
// ✅ Permisos del usuario
```

## 🔄 **Flujos de Uso**

### **Usuario Anónimo (Modo Offline):**

```
1. Usuario abre la app
2. Sistema detecta: no autenticado → modo offline
3. Conversaciones se guardan en localStorage
4. Todo funciona normalmente
5. Opción de autenticarse para acceder a modo online
```

### **Usuario Autenticado (Modo Online):**

```
1. Usuario autenticado abre la app
2. Sistema detecta: autenticado + online → modo online
3. Conversaciones se sincronizan con backend
4. Si falla backend → fallback automático a localStorage
5. Indicador muestra estado actual
```

### **Cambio de Modo:**

```
1. Usuario hace login → auto-switch a online
2. Usuario pierde conexión → auto-switch a offline
3. Usuario puede forzar modo manual
4. Fallback transparente en caso de errores
```

## 🎨 **Diferencias Visuales**

### **Indicadores de Origen:**

- **🌐 Cloud conversations**: Guardadas en backend
- **📱 Local conversations**: Guardadas en localStorage
- **Indicador de modo**: Muestra estado actual
- **Agrupación**: Conversaciones agrupadas por fuente

### **Headers y Metadatos:**

```typescript
// Las conversaciones muestran:
- 💾 Fuente: Cloud/Local
- 🤖 Modelo usado
- 🔧 Proveedor (ollama, anthropic, etc.)
- 📊 Número de mensajes
- ⏰ Última actividad
```

## ⚙️ **Configuración**

### **Variables de Entorno:**

```env
# Usar app unificada por defecto
VITE_USE_UNIFIED_APP=true

# Backend URL (ya existente)
VITE_BACKEND_URL=http://localhost:3001
```

### **localStorage Settings:**

```typescript
// Forzar app unificada
localStorage.setItem('em-use-unified-app', 'true');

// Configuración de chat (se creará automáticamente)
localStorage.setItem('em-chat-config', JSON.stringify({
  preferOnlineMode: true,
  autoSync: true,
  offlineFallback: true,
  maxOfflineConversations: 50,
  maxOfflineMessages: 1000
}));
```

## 🔍 **Debug y Desarrollo**

### **Debug Info:**

En desarrollo, verás:
- Console logs del modo actual
- Botón para cambiar entre apps
- Debug panel con estado actual
- Indicadores visuales de fuente de datos

### **Testing:**

```typescript
// Simular pérdida de conexión
window.navigator.onLine = false;

// Simular logout
authService.clearTokens();

// Forzar modo offline
unifiedChatService.switchToOfflineMode();

// Ver estado
console.log(unifiedChatService.getStatusInfo());
```

## 🚦 **Estado Actual vs Futuro**

### **✅ Implementado:**

- ✅ Detección automática de modo
- ✅ Servicios unificados completos
- ✅ Hooks React especializados
- ✅ Componentes UI actualizados
- ✅ Fallback automático
- ✅ Indicadores visuales
- ✅ Sistema de coexistencia

### **🔄 Pendiente (Fase 3):**

- 🔄 Envío de mensajes en modo offline (necesita ApiManager)
- 🔄 Sincronización bidireccional automática
- 🔄 WebSockets para tiempo real
- 🔄 Migración opcional de datos
- 🔄 Cache inteligente
- 🔄 Manejo de conflictos

---

## 🎉 **¡El sistema está listo para usar!**

Puedes cambiar entre las versiones para comparar:
- **Legacy App**: Comportamiento original
- **Unified App**: Nuevo sistema con coexistencia

El sistema detecta automáticamente el modo apropiado y proporciona una experiencia transparente para todos los usuarios.
