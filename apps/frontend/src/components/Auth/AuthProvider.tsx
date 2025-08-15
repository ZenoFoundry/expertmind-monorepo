import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../../services/authService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  continueAsAnonymous: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAnonymous: false,
    isLoading: true,
    error: null,
  });

  // Verificar si hay una sesión guardada al inicializar
  useEffect(() => {
    checkExistingAuth();
    
    // Escuchar eventos de token expirado
    const handleTokenExpired = () => {
      console.log('🚫 Token expirado detectado, cerrando sesión...');
      logout();
    };
    
    window.addEventListener('auth:token-expired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  const checkExistingAuth = async () => {
    try {
      const savedAuthType = localStorage.getItem('em-auth-type');
      const savedUser = localStorage.getItem('em-user');

      if (savedAuthType === 'anonymous') {
        setAuthState(prev => ({
          ...prev,
          isAnonymous: true,
          isLoading: false,
        }));
      } else if (savedAuthType === 'authenticated' && savedUser) {
        // Verificar si tenemos tokens válidos
        if (authService.hasValidTokens()) {
          const user = JSON.parse(savedUser);
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          // Limpiar datos inválidos
          localStorage.removeItem('em-auth-type');
          localStorage.removeItem('em-user');
          authService.clearTokens();
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al verificar la autenticación',
      }));
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Llamar al backend real
      const response = await authService.login({ email, password });

      // Guardar tokens
      authService.saveTokens(response.tokens);

      // Guardar estado de autenticación
      localStorage.setItem('em-auth-type', 'authenticated');
      localStorage.setItem('em-user', JSON.stringify(response.user));

      setAuthState(prev => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        isAnonymous: false,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión. Verifica tus credenciales.',
      }));
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Llamar al backend real
      const response = await authService.register({ name, email, password });

      // Guardar tokens
      authService.saveTokens(response.tokens);

      // Guardar estado de autenticación
      localStorage.setItem('em-auth-type', 'authenticated');
      localStorage.setItem('em-user', JSON.stringify(response.user));

      setAuthState(prev => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        isAnonymous: false,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Register error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al crear la cuenta. Inténtalo de nuevo.',
      }));
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('em-auth-type');
    localStorage.removeItem('em-user');
    
    // Limpiar tokens
    authService.clearTokens();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isAnonymous: false,
      isLoading: false,
      error: null,
    });
  };

  const continueAsAnonymous = () => {
    localStorage.setItem('em-auth-type', 'anonymous');
    
    setAuthState(prev => ({
      ...prev,
      isAnonymous: true,
      isLoading: false,
      error: null,
    }));
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    continueAsAnonymous,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
