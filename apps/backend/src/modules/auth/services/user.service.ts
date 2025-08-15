import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { CreateUserData } from '../interfaces/user.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly usersFilePath: string;
  private users: Map<string, UserEntity> = new Map();

  constructor() {
    // Directorio para almacenar datos (puede ser configurado via ENV)
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.usersFilePath = path.join(dataDir, 'users.json');
    this.loadUsers();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user || null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async create(userData: CreateUserData): Promise<UserEntity> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const user = UserEntity.fromCreateData(userData);
    this.users.set(user.id, user);
    
    await this.saveUsers();
    this.logger.log(`Usuario creado: ${user.email}`);
    
    return user;
  }

  async update(id: string, updateData: Partial<CreateUserData>): Promise<UserEntity> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar email único si se está cambiando
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('El email ya está en uso');
      }
    }

    user.updateProfile({
      name: updateData.name,
      email: updateData.email,
    });

    await this.saveUsers();
    this.logger.log(`Usuario actualizado: ${user.email}`);
    
    return user;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.updatePassword(hashedPassword);
    await this.saveUsers();
    this.logger.log(`Contraseña actualizada para usuario: ${user.email}`);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) {
      await this.saveUsers();
      this.logger.log(`Usuario eliminado: ${id}`);
    }
    return deleted;
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  private async loadUsers(): Promise<void> {
    try {
      // Crear directorio si no existe
      const dataDir = path.dirname(this.usersFilePath);
      await fs.mkdir(dataDir, { recursive: true });

      // Cargar usuarios existentes
      try {
        const data = await fs.readFile(this.usersFilePath, 'utf-8');
        const usersArray = JSON.parse(data);
        
        this.users.clear();
        usersArray.forEach((userData: any) => {
          const user = UserEntity.fromJSON(userData);
          this.users.set(user.id, user);
        });
        
        this.logger.log(`Cargados ${this.users.size} usuarios desde archivo`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          this.logger.log('Archivo de usuarios no existe, iniciando con datos vacíos');
          await this.saveUsers(); // Crear archivo vacío
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error('Error cargando usuarios:', error.message);
      throw new Error('Error inicializando almacenamiento de usuarios');
    }
  }

  private async saveUsers(): Promise<void> {
    try {
      const usersArray = Array.from(this.users.values()).map(user => ({
        ...user.toJSON(),
        password: user.password, // Incluir password hasheado
      }));
      
      await fs.writeFile(this.usersFilePath, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      this.logger.error('Error guardando usuarios:', error.message);
      throw new Error('Error guardando datos de usuarios');
    }
  }

  // Método para testing/desarrollo
  async clearAllUsers(): Promise<void> {
    this.users.clear();
    await this.saveUsers();
    this.logger.warn('Todos los usuarios han sido eliminados');
  }
}
