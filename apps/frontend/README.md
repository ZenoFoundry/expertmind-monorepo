# ExpertMind Frontend

Aplicación web de chatbox con inteligencia artificial desarrollada en React.

## Características

- ✅ Chat en tiempo real con modelos de IA
- ✅ Interfaz responsiva y moderna
- ✅ Modo oscuro
- ✅ Integración con backend NestJS
- ✅ Soporte para múltiples modelos (vía Ollama)
- ✅ **Soporte para Anthropic Claude API**

## Desarrollo

```bash
# Instalar dependencias
yarn install

# Desarrollo
yarn dev

# Build para producción
yarn build
```

## Configuración

### Backend Local (Ollama)
La aplicación se conecta al backend en `http://localhost:3001` por defecto.

Para cambiar la URL del API, configura la variable de entorno:
```env
VITE_API_URL=http://tu-backend-url
```

### Anthropic Claude API (Desarrollo)

Para usar la API de Anthropic Claude en desarrollo, sigue estos pasos:

#### 1. Obtener API Key
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. Genera una API Key en la sección "API Keys"
4. Copia la API Key (formato: `sk-ant-...`)

#### 2. Configurar en la aplicación
1. **Ejecuta la aplicación** con `yarn dev`
2. **Abre la configuración** (generalmente un ícono de engranaje o settings)
3. **Cambia los siguientes valores:**
   - **URL:** `/api/anthropic/v1/messages`
   - **API Key:** Tu API key de Anthropic (pega el valor `sk-ant-...`)
   - **Model:** `claude-3-haiku-20240307` (recomendado para desarrollo)
   - **Max Tokens:** `1024` (o el valor que prefieras)
   - **Temperature:** `0.7` (opcional)

#### 3. Verificar funcionamiento
1. **Envía un mensaje de prueba** como "Hola, ¿cómo estás?"
2. **Revisa la consola del navegador** para ver los logs:
   ```
   🔍 Detected API provider: anthropic
   📡 Using URL: /api/anthropic/v1/messages
   📤 Request headers: {...}
   📥 Response status: 200 OK
   ```
3. **Deberías recibir una respuesta** de Claude

#### 4. Modelos disponibles
- `claude-3-haiku-20240307` - Rápido y económico (recomendado para desarrollo)
- `claude-3-sonnet-20240229` - Balance entre velocidad y capacidad
- `claude-3-opus-20240229` - Máxima capacidad (más lento y costoso)

#### 5. Troubleshooting

**Error 401 Unauthorized:**
- Verifica que tu API Key sea correcta y esté activa
- Asegúrate de que la URL sea exactamente `/api/anthropic/v1/messages`

**Error de CORS:**
- El proxy de Vite debe manejar esto automáticamente
- Si persiste, reinicia el servidor de desarrollo

**Error de modelo no encontrado:**
- Verifica que el modelo especificado esté disponible
- Usa `claude-3-haiku-20240307` para desarrollo

#### 6. Configuración avanzada

El sistema detecta automáticamente si estás usando Anthropic basándose en la URL. No necesitas configuración adicional.

**Características automáticas:**
- ✅ Detección automática del proveedor de API
- ✅ Headers correctos (`x-api-key`, `anthropic-version`, `anthropic-dangerous-direct-browser-access`)
- ✅ Formato de payload correcto para Claude
- ✅ Manejo de respuestas específico para Anthropic
- ✅ Logs detallados para debugging

### Alternar entre APIs

Puedes cambiar fácilmente entre Ollama (local) y Anthropic:

**Para Ollama:**
- URL: `http://localhost:3001/ollama/chat`
- API Key: (vacío o tu configuración local)

**Para Anthropic:**
- URL: `/api/anthropic/v1/messages`
- API Key: `sk-ant-...`

## Scripts Disponibles

- `yarn dev` - Servidor de desarrollo
- `yarn build` - Build de producción
- `yarn preview` - Preview del build
- `yarn lint` - Linting del código
- `yarn type-check` - Verificación de tipos TypeScript

## Arquitectura

### Proxy Configuration
El proyecto incluye un proxy de Vite configurado para redirigir las llamadas de `/api/anthropic/*` hacia `https://api.anthropic.com/*`, evitando problemas de CORS en desarrollo.

### API Manager
El `ApiManager` detecta automáticamente el tipo de API basándose en la URL y ajusta:
- Headers de autenticación
- Formato del payload
- Procesamiento de respuestas

Esto permite usar múltiples proveedores de IA sin cambios en el código de la aplicación.
