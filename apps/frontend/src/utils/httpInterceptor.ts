import { authService } from '../services/authService';

export interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export interface InterceptorResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

export class HttpInterceptor {
  // Interceptar request para añadir automáticamente el token JWT
  static async interceptRequest(
    url: string, 
    config: RequestConfig
  ): Promise<RequestConfig> {
    // Crear una copia del config para no mutar el original
    const interceptedConfig: RequestConfig = {
      ...config,
      headers: { ...config.headers }
    };

    // Solo añadir token si es una llamada a nuestro backend
    if (this.isBackendRequest(url)) {
      const token = authService.getAccessToken();
      
      if (token) {
        interceptedConfig.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Token JWT añadido a la request:', url);
      } else {
        console.log('🔓 No hay token disponible para:', url);
      }
    }

    // Log de la request para debugging
    console.log('📤 HTTP Request:', {
      url,
      method: config.method,
      headers: interceptedConfig.headers
    });

    return interceptedConfig;
  }

  // Interceptar response para manejar errores de autenticación
  static async interceptResponse(
    url: string,
    response: Response
  ): Promise<InterceptorResponse> {
    console.log('📥 HTTP Response:', {
      url,
      status: response.status,
      statusText: response.statusText
    });

    // Si es 401 Unauthorized en nuestro backend, limpiar tokens
    if (response.status === 401 && this.isBackendRequest(url)) {
      console.log('🚫 Token inválido o expirado, limpiando sesión...');
      authService.clearTokens();
      
      // Opcional: Disparar evento para que la UI se actualice
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }

    // Crear un wrapper del response para mantener la misma interfaz
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      json: () => response.json(),
      text: () => response.text()
    };
  }

  // Método principal para hacer requests con interceptors
  static async fetch(
    url: string, 
    config: RequestConfig
  ): Promise<InterceptorResponse> {
    try {
      // Interceptar request
      const interceptedConfig = await this.interceptRequest(url, config);

      // Hacer la request
      const response = await fetch(url, interceptedConfig);

      // Interceptar response
      return await this.interceptResponse(url, response);
    } catch (error) {
      console.error('❌ Error en HttpInterceptor.fetch:', error);
      throw error;
    }
  }

  // Verificar si la URL es de nuestro backend
  private static isBackendRequest(url: string): boolean {
    const backendUrls = [
      'http://localhost:3001',
      '/api', // Para proxies
      'localhost:3001'
    ];

    return backendUrls.some(backendUrl => 
      url.includes(backendUrl)
    );
  }

  // Método de conveniencia para GET
  static async get(url: string, headers: Record<string, string> = {}): Promise<InterceptorResponse> {
    return this.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  // Método de conveniencia para POST
  static async post(
    url: string, 
    body: any, 
    headers: Record<string, string> = {}
  ): Promise<InterceptorResponse> {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: typeof body === 'string' ? body : JSON.stringify(body)
    });
  }

  // Método de conveniencia para PUT
  static async put(
    url: string, 
    body: any, 
    headers: Record<string, string> = {}
  ): Promise<InterceptorResponse> {
    return this.fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: typeof body === 'string' ? body : JSON.stringify(body)
    });
  }

  // Método de conveniencia para DELETE
  static async delete(url: string, headers: Record<string, string> = {}): Promise<InterceptorResponse> {
    return this.fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }
}
