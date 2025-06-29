import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ExpertMind Backend API está funcionando! 🚀';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'expertmind-backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
