import { HttpInterceptor } from '../utils/httpInterceptor';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface AuthError {
  success: false;
  message: string;
  error?: string;
}

export class AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  // Login del usuario
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await HttpInterceptor.post(
        `${this.baseUrl}/auth/login`,
        credentials
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('AuthService.login error:', error);
      throw error;
    }
  }

  // Registro de nuevo usuario
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await HttpInterceptor.post(
        `${this.baseUrl}/auth/register`,
        userData
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('AuthService.register error:', error);
      throw error;
    }
  }

  // Verificar health del servicio de auth
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await HttpInterceptor.post(
        `${this.baseUrl}/auth/health`,
        {}
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AuthService.healthCheck error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor de autenticación'
      };
    }
  }

  // Guardar tokens en localStorage
  saveTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem('em-access-token', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('em-refresh-token', tokens.refreshToken);
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  // Obtener access token guardado
  getAccessToken(): string | null {
    try {
      return localStorage.getItem('em-access-token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Obtener refresh token guardado
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('em-refresh-token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Limpiar tokens guardados
  clearTokens(): void {
    try {
      localStorage.removeItem('em-access-token');
      localStorage.removeItem('em-refresh-token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Verificar si hay tokens válidos (básico)
  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.hasValidTokens();
  }

  // Obtener información del usuario desde el token (básico parsing)
  getCurrentUser(): Partial<User> | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      // Decodificar el payload del JWT (sin verificar la firma - solo para leer datos)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}

// Instancia singleton del servicio
export const authService = new AuthService();
