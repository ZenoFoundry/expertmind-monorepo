import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../services/user.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    console.debug('🏗️ JwtStrategy - Constructor called');
    console.debug('🏗️ JwtStrategy - JWT_SECRET exists:', !!configService.get<string>('JWT_SECRET'));
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.debug('🔍 JwtStrategy.validate - Payload received:', payload);
    
    try {
      // Verificar que el usuario existe
      const user = await this.userService.findById(payload.sub);
      console.debug('👤 JwtStrategy.validate - User found:', user ? { id: user.id, email: user.email } : null);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Retornar el usuario para que esté disponible en req.user
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error('❌ JwtStrategy.validate - Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
