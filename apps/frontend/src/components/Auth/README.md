# Sistema de Autenticación - ExpertMind

## 🚀 Funcionalidades Implementadas

### Componentes Principales

1. **AuthProvider** - Context provider para manejar estado de autenticación
2. **AuthModal** - Modal con formularios de login/registro + opción anónima
3. **LoginForm** - Formulario de inicio de sesión
4. **RegisterForm** - Formulario de registro de usuario
5. **UserProfile** - Componente que muestra el estado del usuario en el sidebar

### Estados de Usuario

- **🔐 Autenticado**: Usuario con cuenta registrada
- **👤 Anónimo**: Usuario sin cuenta (puede usar la app)
- **❓ Sin autenticar**: Estado inicial (puede abrir modal)

### Características

✅ **Modal opcional** - Los usuarios pueden usar la app sin autenticarse
✅ **Continuar sin cuenta** - Opción para usuarios anónimos
✅ **Persistencia** - El estado se guarda en localStorage
✅ **Auto-cierre** - El modal se cierra automáticamente tras auth
✅ **Navegación fácil** - Switch entre login/register
✅ **Validaciones** - Frontend validation para passwords
✅ **UX fluida** - Estados de loading, errores, etc.
✅ **Responsive** - Funciona en mobile y desktop
✅ **Teclado** - ESC para cerrar, Enter para submit
✅ **Click fuera** - Cerrar modal clickeando overlay

## 🎨 Diseño

- Mantiene el tema dark minimalista existente
- Colores consistentes con la paleta (celeste/negro)
- Animaciones suaves
- Iconos de Lucide React
- Estados visuales claros

## 📱 Cómo Usar

### Para el Usuario Final

1. **Abrir la app** - Funciona inmediatamente sin login
2. **Ver perfil** - Área de usuario en el sidebar
3. **Autenticarse** - Click en "Iniciar Sesión" abre el modal
4. **Usar sin cuenta** - Click en "Continuar sin cuenta"
5. **Cambiar de formulario** - Links para switch login/register
6. **Cerrar sesión** - Botón de logout para usuarios autenticados

### Para el Desarrollador

```tsx
// El AuthProvider envuelve toda la app
<AuthProvider>
  <App />
</AuthProvider>

// Usar el hook de auth en cualquier componente
const { user, isAuthenticated, isAnonymous, login, logout } = useAuth();

// Mostrar el modal cuando sea necesario
{showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
```

## 🔧 Próximos Pasos (Backend)

1. **Crear endpoints de auth** en NestJS
2. **Implementar JWT** tokens
3. **Base de datos** para usuarios
4. **Conectar frontend** con API real
5. **Middleware de auth** para rutas protegidas
6. **Roles y permisos** (opcional)

## 📂 Estructura de Archivos

```
src/components/Auth/
├── AuthProvider.tsx     # Context de autenticación
├── AuthModal.tsx        # Modal principal
├── LoginForm.tsx        # Formulario de login
├── RegisterForm.tsx     # Formulario de registro
├── UserProfile.tsx      # Perfil de usuario
├── auth.css            # Estilos específicos
└── index.ts            # Exports
```

## 🎯 Estados y Flujos

### Estado Inicial
- Usuario ve la app normalmente
- Sidebar muestra botón "Iniciar Sesión"
- Todas las funciones disponibles

### Flujo de Login
1. User click "Iniciar Sesión"
2. Se abre AuthModal
3. User llena formulario
4. Auth exitoso → Modal se cierra
5. Sidebar muestra perfil del usuario

### Flujo Anónimo
1. User click "Continuar sin cuenta"
2. Modal se cierra
3. Sidebar muestra estado anónimo
4. User puede usar app normalmente

### Persistencia
- `localStorage['em-auth-type']`: 'authenticated' | 'anonymous'
- `localStorage['em-user']`: JSON del usuario (si autenticado)
- Se restaura automáticamente al recargar

## 💡 Notas Técnicas

- **Simulación actual**: Login/register son simulados (delay de 1s)
- **Avatars**: Se generan automáticamente con UI Avatars
- **Validaciones**: Frontend-only por ahora
- **Errores**: Manejados y mostrados en la UI
- **Loading states**: Feedback visual durante operaciones

## 🚧 Limitaciones Actuales

- Sin backend real (simulado)
- Sin validación de email real
- Sin recuperación de contraseña
- Sin 2FA o OAuth
- Sin sincronización entre dispositivos

Estas limitaciones se resolverán al implementar el backend con NestJS + JWT.
