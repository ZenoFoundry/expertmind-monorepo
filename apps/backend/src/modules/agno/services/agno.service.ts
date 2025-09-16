import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AgnoRunRequestDto } from '../dtos/agno-request.dto';
import { 
  AgnoRunResponse, 
  AgnoKnowledgeLoadResponse, 
  AgnoHealthResponse,
  AgnoAgent 
} from '../dtos/agno-response.dto';

@Injectable()
export class AgnoService {
  private readonly logger = new Logger(AgnoService.name);
  private readonly agnoUrl: string;
  private readonly defaultAgentId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.agnoUrl = this.configService.get<string>('AGNO_API_URL', 'http://localhost:8000');
    this.defaultAgentId = this.configService.get<string>('AGNO_DEFAULT_AGENT_ID', 'agno_assist');
    this.logger.log(`Agno API URL configurada: ${this.agnoUrl}`);
    this.logger.log(`Agno Agent ID por defecto: ${this.defaultAgentId}`);
  }

  /**
   * Envía un mensaje a un agente de Agno
   */
  async runAgent(agentId: string, request: AgnoRunRequestDto): Promise<AgnoRunResponse> {
    try {
      this.logger.log(`Enviando mensaje a agente: ${agentId} con modelo: ${request.model}`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.agnoUrl}/v1/agents/${agentId}/runs`,
          {
            message: request.message,
            stream: request.stream || false,
            model: request.model,
            user_id: request.user_id,
            session_id: request.session_id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 60000, // 60 segundos timeout
          }
        )
      );

      // Si es una respuesta streaming, manejar diferente
      if (request.stream) {
        // Por ahora no soportamos streaming, devolver error
        throw new Error('Streaming no soportado en esta implementación');
      }

      return {
        content: response.data,
        metadata: {
          agent_id: agentId,
          model: request.model,
          user_id: request.user_id,
          session_id: request.session_id,
        }
      };
    } catch (error) {
      this.logger.error('Error comunicándose con Agno API:', error.message);
      if (error.response?.data) {
        this.logger.error('Detalles del error:', error.response.data);
      }
      throw new Error(`Error comunicándose con Agno API: ${error.message}`);
    }
  }

  /**
   * Ejecuta el agente por defecto
   */
  async runDefaultAgent(request: AgnoRunRequestDto): Promise<AgnoRunResponse> {
    return this.runAgent(this.defaultAgentId, request);
  }

  /**
   * Obtiene la lista de agentes disponibles
   */
  async getAvailableAgents(): Promise<string[]> {
    try {
      this.logger.log('Obteniendo lista de agentes disponibles');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.agnoUrl}/v1/agents`, {
          timeout: 10000,
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo agentes de Agno:', error.message);
      throw new Error(`Error obteniendo agentes: ${error.message}`);
    }
  }

  /**
   * Carga la base de conocimiento de un agente
   */
  async loadAgentKnowledge(agentId: string): Promise<AgnoKnowledgeLoadResponse> {
    try {
      this.logger.log(`Cargando base de conocimiento para agente: ${agentId}`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.agnoUrl}/v1/agents/${agentId}/knowledge/load`,
          {},
          {
            timeout: 120000, // 2 minutos para carga de conocimiento
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error cargando conocimiento del agente:', error.message);
      throw new Error(`Error cargando conocimiento: ${error.message}`);
    }
  }

  /**
   * Verifica si la API de Agno está disponible
   */
  async isAgnoReady(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.agnoUrl}/v1/health`, {
          timeout: 5000,
        })
      );
      
      this.logger.log('Agno API está disponible');
      return response.status === 200;
    } catch (error) {
      this.logger.warn('Agno API no está disponible:', error.message);
      return false;
    }
  }

  /**
   * Obtiene información de salud de la API
   */
  async getHealthStatus(): Promise<AgnoHealthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.agnoUrl}/v1/health`, {
          timeout: 5000,
        })
      );
      
      return {
        status: 'healthy',
        agents: response.data.agents || [],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        agents: [],
      };
    }
  }
}
