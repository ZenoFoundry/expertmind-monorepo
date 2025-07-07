# ExpertMind Frontend

Aplicación web de chatbox con inteligencia artificial desarrollada en React.

## Características

- ✅ Chat en tiempo real con modelos de IA
- ✅ Interfaz responsiva y moderna
- ✅ Modo oscuro
- ✅ Integración con backend NestJS
- ✅ Soporte para múltiples modelos (vía Ollama)

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

La aplicación se conecta al backend en `http://localhost:3001` por defecto.

Para cambiar la URL del API, configura la variable de entorno:
```env
VITE_API_URL=http://tu-backend-url
```

## Scripts Disponibles

- `yarn dev` - Servidor de desarrollo
- `yarn build` - Build de producción
- `yarn preview` - Preview del build
- `yarn lint` - Linting del código
- `yarn type-check` - Verificación de tipos TypeScript
