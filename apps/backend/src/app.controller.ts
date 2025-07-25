import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check del API' })
  @ApiResponse({ status: 200, description: 'API funcionando correctamente' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Estado de salud del servicio' })
  @ApiResponse({ status: 200, description: 'Estado de salud del servicio' })
  getHealth() {
    return this.appService.getHealth();
  }
}
