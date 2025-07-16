import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { OllamaService } from '../services/ollama.service';
import { ChatRequestDto, GenerateRequestDto } from '../dtos/chat-request.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { ChatResponseMapper } from '../mappers/chat-response.mapper';
import { GenerateResponseMapper } from '../mappers/generate-response.mapper';

@ApiTags('ollama')
@Controller('ollama')
export class OllamaController {
  private readonly logger = new Logger(OllamaController.name);

  constructor(
    private readonly ollamaService: OllamaService,
    private readonly chatResponseMapper: ChatResponseMapper,
    private readonly generateResponseMapper: GenerateResponseMapper,
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'Obtener todos los modelos disponibles en Ollama' })
  @ApiResponse({ status: 200, description: 'Lista de modelos disponibles' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getModels(): Promise<ApiResponseDto> {
    try {
      const models = await this.ollamaService.getModels();
      return {
        success: true,
        data: models,
        message: 'Modelos obtenidos exitosamente',
      };
    } catch (error) {
      this.logger.error('Error obteniendo modelos:', error.message);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Verificar el estado de conexión con Ollama' })
  @ApiResponse({ status: 200, description: 'Estado de Ollama' })
  async getStatus(): Promise<ApiResponseDto> {
    try {
      const isReady = await this.ollamaService.isOllamaReady();
      return {
        success: true,
        data: {
          ollama_ready: isReady,
          timestamp: new Date().toISOString(),
        },
        message: isReady ? 'Ollama está disponible' : 'Ollama no está disponible',
      };
    } catch (error) {
      this.logger.error('Error verificando estado:', error.message);
      return {
        success: false,
        data: {
          ollama_ready: false,
          timestamp: new Date().toISOString(),
        },
        message: 'Error verificando estado de Ollama',
      };
    }
  }

  @Post('chat')
  @ApiOperation({ summary: 'Iniciar una conversación con un modelo de Ollama' })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({ status: 200, description: 'Respuesta del chat' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ApiResponseDto> {
    try {
      const response = await this.ollamaService.chat(chatRequest);
      const mappedResponse = this.chatResponseMapper.toDto(response);
      
      return {
        success: true,
        data: mappedResponse,
        message: 'Chat completado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error en chat:', error.message);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generar una respuesta usando un modelo de Ollama' })
  @ApiBody({ type: GenerateRequestDto })
  @ApiResponse({ status: 200, description: 'Respuesta generada' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async generate(@Body() generateRequest: GenerateRequestDto): Promise<ApiResponseDto> {
    try {
      const response = await this.ollamaService.generate(generateRequest);
      const mappedResponse = this.generateResponseMapper.toDto(response);
      
      return {
        success: true,
        data: mappedResponse,
        message: 'Respuesta generada exitosamente',
      };
    } catch (error) {
      this.logger.error('Error generando respuesta:', error.message);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('pull/:modelName')
  @ApiOperation({ summary: 'Descargar un modelo específico' })
  @ApiParam({ name: 'modelName', description: 'Nombre del modelo a descargar' })
  @ApiResponse({ status: 200, description: 'Modelo descargado exitosamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async pullModel(@Param('modelName') modelName: string): Promise<ApiResponseDto> {
    try {
      const result = await this.ollamaService.pullModel(modelName);
      return {
        success: true,
        data: result,
        message: `Modelo ${modelName} descargado exitosamente`,
      };
    } catch (error) {
      this.logger.error('Error descargando modelo:', error.message);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
