import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequestDto, RegisterRequestDto } from '../dtos/auth-request.dto';
import { 
  LoginResponseDto, 
  RegisterResponseDto, 
  AuthErrorResponseDto,
  UserResponseDto
} from '../dtos/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
}))
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con email y contraseña, retorna tokens JWT'
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    type: AuthErrorResponseDto
  })
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      this.logger.log(`Intento de login para: ${loginDto.email}`);
      
      const result = await this.authService.login(loginDto);
      
      return {
        success: true,
        message: 'Login exitoso',
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      this.logger.error(`Error en login para ${loginDto.email}:`, error.message);
      
      if (error.message.includes('Credenciales inválidas')) {
        throw new HttpException(
          {
            success: false,
            message: 'Email o contraseña incorrectos',
            error: 'INVALID_CREDENTIALS',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Error interno del servidor',
          error: 'INTERNAL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario y retorna tokens JWT'
  })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email ya está registrado',
    type: AuthErrorResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    type: AuthErrorResponseDto
  })
  async register(@Body() registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    try {
      this.logger.log(`Intento de registro para: ${registerDto.email}`);
      
      const result = await this.authService.register(registerDto);
      
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      this.logger.error(`Error en registro para ${registerDto.email}:`, error.message);
      
      if (error.message.includes('email ya está registrado')) {
        throw new HttpException(
          {
            success: false,
            message: 'El email ya está registrado',
            error: 'EMAIL_ALREADY_EXISTS',
          },
          HttpStatus.CONFLICT,
        );
      }
      
      if (error.message.includes('validación')) {
        throw new HttpException(
          {
            success: false,
            message: 'Datos de entrada inválidos',
            error: 'VALIDATION_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Error interno del servidor',
          error: 'INTERNAL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint para verificar el estado del servicio de auth
  @Post('health')
  @ApiOperation({ 
    summary: 'Verificar estado del servicio de autenticación',
    description: 'Endpoint para verificar que el servicio está funcionando'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Servicio funcionando correctamente'
  })
  async healthCheck() {
    return {
      success: true,
      message: 'Servicio de autenticación funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
