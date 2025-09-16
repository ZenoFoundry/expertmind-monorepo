import { Controller, Get, Post, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AgnoService } from '../services/agno.service';
import { AgnoRunRequestDto } from '../dtos/agno-request.dto';
import { AgnoRunResponse, AgnoHealthResponse } from '../dtos/agno-response.dto';

@ApiTags('Agno')
@Controller('agno')
export class AgnoController {
  constructor(private readonly agnoService: AgnoService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado de salud de Agno API' })
  @ApiResponse({ status: 200, description: 'Estado de salud de Agno API' })
  async getHealth(): Promise<{ status: string; data?: any }> {
    try {
      const healthStatus = await this.agnoService.getHealthStatus();
      
      if (healthStatus.status === 'healthy') {
        return {
          status: 'success',
          data: {
            agno_ready: true,
            agents: healthStatus.agents,
            api_url: 'Agent API healthy'
          }
        };
      } else {
        return {
          status: 'error',
          data: {
            agno_ready: false,
            error: 'Agno API not available'
          }
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          data: {
            agno_ready: false,
            error: error.message
          }
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Get('agents')
  @ApiOperation({ summary: 'Obtener lista de agentes disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de agentes disponibles' })
  async getAgents(): Promise<{ status: string; data: string[] }> {
    try {
      const agents = await this.agnoService.getAvailableAgents();
      return {
        status: 'success',
        data: agents
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          data: [],
          error: error.message
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Post('run')
  @ApiOperation({ summary: 'Ejecutar agente por defecto' })
  @ApiResponse({ status: 200, description: 'Respuesta del agente' })
  async runDefaultAgent(@Body() request: AgnoRunRequestDto): Promise<{ status: string; data: any }> {
    try {
      const result = await this.agnoService.runDefaultAgent(request);
      return {
        status: 'success',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('agents/:agentId/run')
  @ApiOperation({ summary: 'Ejecutar agente específico' })
  @ApiParam({ name: 'agentId', description: 'ID del agente a ejecutar' })
  @ApiResponse({ status: 200, description: 'Respuesta del agente' })
  async runAgent(
    @Param('agentId') agentId: string,
    @Body() request: AgnoRunRequestDto
  ): Promise<{ status: string; data: any }> {
    try {
      const result = await this.agnoService.runAgent(agentId, request);
      return {
        status: 'success',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('agents/:agentId/knowledge/load')
  @ApiOperation({ summary: 'Cargar base de conocimiento de un agente' })
  @ApiParam({ name: 'agentId', description: 'ID del agente' })
  @ApiResponse({ status: 200, description: 'Conocimiento cargado exitosamente' })
  async loadAgentKnowledge(@Param('agentId') agentId: string): Promise<{ status: string; data: any }> {
    try {
      const result = await this.agnoService.loadAgentKnowledge(agentId);
      return {
        status: 'success',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
