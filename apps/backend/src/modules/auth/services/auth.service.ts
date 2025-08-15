import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { LoginRequestDto, RegisterRequestDto } from '../dtos/auth-request.dto';
import { JwtPayload, LoginResult, AuthTokens } from '../interfaces/auth.interface';
import { UserEntity } from '../entities/user.entity';
import { CreateUserData } from '../interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginRequestDto): Promise<LoginResult> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`Usuario ${email} inició sesión exitosamente`);

    return {
      user: user.toResponse(),
      tokens,
    };
  }

  async register(registerDto: RegisterRequestDto): Promise<LoginResult> {
    const { email, password, name } = registerDto;

    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Hash de la contraseña
      const hashedPassword = await this.hashPassword(password);

      // Crear usuario
      const userData: CreateUserData = {
        email,
        name,
        password: hashedPassword,
      };

      const user = await this.userService.create(userData);

      // Generar tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`Usuario ${email} registrado exitosamente`);

      return {
        user: user.toResponse(),
        tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error registrando usuario ${email}:`, error.message);
      throw new Error('Error interno del servidor');
    }
  }

  async validateUser(payload: JwtPayload): Promise<UserEntity | null> {
    try {
      const user = await this.userService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Error validando usuario desde JWT:', error.message);
      return null;
    }
  }

  async generateTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
      });

      return {
        accessToken,
        // TODO: Implementar refresh tokens en el futuro
        // refreshToken: await this.generateRefreshToken(user),
      };
    } catch (error) {
      this.logger.error('Error generando tokens JWT:', error.message);
      throw new Error('Error generando tokens de autenticación');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '12'), 10);
    return bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error('Error validando contraseña:', error.message);
      return false;
    }
  }

  // Método para cambiar contraseña (futuro)
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isOldPasswordValid = await this.validatePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    await this.userService.updatePassword(userId, hashedNewPassword);

    this.logger.log(`Contraseña cambiada para usuario: ${user.email}`);
  }

  // Método para verificar token (futuro uso con guards)
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error('Error verificando token JWT:', error.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
