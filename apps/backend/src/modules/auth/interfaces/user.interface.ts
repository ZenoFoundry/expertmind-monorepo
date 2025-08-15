export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hash
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}
