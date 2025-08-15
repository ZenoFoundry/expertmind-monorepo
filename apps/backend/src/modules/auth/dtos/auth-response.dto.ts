import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'URL del avatar del usuario',
    example: 'https://ui-avatars.com/api/?name=Juan+Perez',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'Fecha de creación de la cuenta',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  createdAt?: Date;
}

export class AuthTokensDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de renovación (opcional)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo',
    example: 'Login exitoso',
  })
  message: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Tokens de autenticación',
    type: AuthTokensDto,
  })
  tokens: AuthTokensDto;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo',
    example: 'Usuario registrado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Datos del usuario creado',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Tokens de autenticación',
    type: AuthTokensDto,
  })
  tokens: AuthTokensDto;
}

export class AuthErrorResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje de error',
    example: 'Credenciales inválidas',
  })
  message: string;

  @ApiProperty({
    description: 'Código de error',
    example: 'INVALID_CREDENTIALS',
    required: false,
  })
  error?: string;
}
