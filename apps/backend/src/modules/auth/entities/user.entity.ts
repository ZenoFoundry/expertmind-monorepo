import { User as IUser, CreateUserData, UserResponse } from '../interfaces/user.interface';

export class UserEntity implements IUser {
  id: string;
  email: string;
  name: string;
  password: string; // Hash
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;

  constructor(data: Partial<UserEntity>) {
    this.id = data.id || this.generateId();
    this.email = data.email;
    this.name = data.name;
    this.password = data.password;
    this.avatar = data.avatar || this.generateAvatar(data.name);
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  static fromCreateData(data: CreateUserData): UserEntity {
    return new UserEntity({
      email: data.email,
      name: data.name,
      password: data.password, // Se debe hashear antes
    });
  }

  toResponse(): UserResponse {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatar: this.avatar,
      createdAt: this.createdAt,
    };
  }

  updatePassword(hashedPassword: string): void {
    this.password = hashedPassword;
    this.updatedAt = new Date();
  }

  updateProfile(data: { name?: string; email?: string }): void {
    if (data.name) {
      this.name = data.name;
      this.avatar = this.generateAvatar(data.name);
    }
    if (data.email) {
      this.email = data.email;
    }
    this.updatedAt = new Date();
  }

  private generateId(): string {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateAvatar(name: string): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=00bcd4&color=fff&size=128`;
  }

  // Métodos para serialización JSON
  toJSON(): any {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static fromJSON(data: any): UserEntity {
    return new UserEntity({
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password, // Incluir password hasheado
      avatar: data.avatar,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      isActive: data.isActive,
    });
  }
}
