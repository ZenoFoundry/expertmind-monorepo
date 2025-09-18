# ExpertMind Backoffice

Sistema de administración para el monorepo ExpertMind. Desarrollado con React + TypeScript + Ant Design.

## 🚀 Características

- **Dashboard con estadísticas** en tiempo real
- **Gestión de usuarios** del sistema
- **Configuración de perfiles** de IA con diferentes LLMs
- **Administración de MCP** (Model Context Protocol)
- **Autenticación segura** con JWT
- **Interfaz moderna** con Ant Design
- **Responsive design** para diferentes dispositivos

## 🛠️ Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Ant Design** - Biblioteca de componentes UI
- **React Router** - Navegación
- **Recharts** - Gráficos y visualizaciones
- **Vite** - Build tool y servidor de desarrollo
- **Day.js** - Manipulación de fechas

## 📦 Instalación

```bash
# Desde la raíz del monorepo
npm install

# O instalar solo las dependencias del backoffice
cd apps/backoffice
npm install
```

## 🔧 Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev --workspace=apps/backoffice

# O desde la carpeta del backoffice
cd apps/backoffice
npm run dev
```

La aplicación estará disponible en `http://localhost:5174`

## 👥 Credenciales de Acceso

Para desarrollo y testing, puedes usar estas credenciales:

- **Administrador**: `admin` / `admin123`
- **Operador**: `operator` / `operator123`

## 📋 Módulos

### Dashboard
- Estadísticas generales del sistema
- Gráficos de actividad de usuarios
- Métricas de uso de tokens
- Usuarios más activos

### Usuarios
- Lista completa de usuarios del sistema
- Crear, editar y eliminar usuarios
- Asignar perfiles a usuarios
- Activar/desactivar usuarios

### Perfiles
- Configuración de perfiles de IA
- Gestión de prompts del sistema
- Configuración de proveedores LLM
- Límites de tokens por perfil
- Asignación de configuraciones MCP

### MCP (Model Context Protocol)
- Configuraciones estándar de MCP
- Tipos: Sistema de archivos, Base de datos, APIs, Herramientas
- Configuraciones populares predefinidas
- Editor JSON para configuraciones avanzadas

## 🏗️ Estructura del Proyecto

```
apps/backoffice/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── services/      # Servicios y API calls (mockeados)
│   ├── hooks/         # Hooks personalizados
│   ├── types/         # Definiciones de TypeScript
│   ├── utils/         # Utilidades y helpers
│   └── App.tsx        # Componente principal
├── public/            # Archivos estáticos
└── package.json       # Dependencias y scripts
```

## 🔄 Servicios Mockeados

Todos los servicios están completamente mockeados para desarrollo:

- **AuthService**: Autenticación con credenciales de prueba
- **UserService**: CRUD de usuarios con datos simulados
- **ProfileService**: Gestión de perfiles de IA
- **MCPService**: Configuraciones MCP predefinidas
- **DashboardService**: Estadísticas y gráficos simulados

## 🚢 Build para Producción

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/`

## 🔮 Próximas Funcionalidades

- [ ] Integración real con el backend de ExpertMind
- [ ] Sistema de roles y permisos más granular
- [ ] Logs de auditoría
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Configuración de temas personalizados

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../../LICENSE) para detalles.
