import { User } from '@/types';

// Mock data
let mockUsers: User[] = [
  {
    id: '1',
    email: 'ana.garcia@company.com',
    name: 'Ana García',
    profileId: '1',
    profileName: 'Chat Assistant',
    lastLogin: '2025-09-16T14:30:00Z',
    createdAt: '2025-08-15T10:00:00Z',
    isActive: true
  },
  {
    id: '2',
    email: 'carlos.rodriguez@company.com',
    name: 'Carlos Rodríguez',
    profileId: '2',
    profileName: 'Code Helper',
    lastLogin: '2025-09-16T16:45:00Z',
    createdAt: '2025-08-20T09:15:00Z',
    isActive: true
  },
  {
    id: '3',
    email: 'maria.lopez@company.com',
    name: 'María López',
    profileId: '1',
    profileName: 'Chat Assistant',
    lastLogin: '2025-09-15T08:20:00Z',
    createdAt: '2025-08-22T11:30:00Z',
    isActive: true
  },
  {
    id: '4',
    email: 'juan.perez@company.com',
    name: 'Juan Pérez',
    profileId: '3',
    profileName: 'Content Writer',
    lastLogin: '2025-09-14T13:10:00Z',
    createdAt: '2025-09-01T14:45:00Z',
    isActive: false
  },
  {
    id: '5',
    email: 'lucia.fernandez@company.com',
    name: 'Lucía Fernández',
    profileId: '2',
    profileName: 'Code Helper',
    lastLogin: '2025-09-16T12:15:00Z',
    createdAt: '2025-09-05T16:20:00Z',
    isActive: true
  }
];

class UserService {
  async getUsers(): Promise<User[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockUsers];
  }

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      ...userData,
      id: (mockUsers.length + 1).toString(),
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return mockUsers[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    mockUsers.splice(userIndex, 1);
  }

  async toggleUserStatus(id: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(user => user.id === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    user.isActive = !user.isActive;
    return user;
  }
}

export const userService = new UserService();
