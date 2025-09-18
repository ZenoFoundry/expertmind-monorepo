import { AuthUser, LoginCredentials } from '@/types';

// Mock users for authentication
const mockAuthUsers: AuthUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@expertmind.com',
    name: 'Jefe',
    role: 'admin'
  },
  {
    id: '2',
    username: 'operator',
    email: 'operator@expertmind.com',
    name: 'Operador',
    role: 'operator'
  }
];

class AuthService {
  private readonly TOKEN_KEY = 'expertmind_backoffice_token';
  private readonly USER_KEY = 'expertmind_backoffice_user';

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication - check against demo credentials
    const mockCredentials = {
      admin: 'admin123',
      operator: 'operator123'
    };

    if (mockCredentials[credentials.username as keyof typeof mockCredentials] === credentials.password) {
      const user = mockAuthUsers.find(u => u.username === credentials.username);
      if (user) {
        const token = `mock_token_${user.id}_${Date.now()}`;
        
        // Store in localStorage
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        
        return { user, token };
      }
    }

    throw new Error('Credenciales inválidas');
  }

  async logout(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }
}

export const authService = new AuthService();
