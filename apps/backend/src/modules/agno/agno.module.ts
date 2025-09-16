import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgnoService } from './services/agno.service';
import { AgnoController } from './controller/agno.controller';

@Module({
  imports: [HttpModule],
  controllers: [AgnoController],
  providers: [AgnoService],
  exports: [AgnoService],
})
export class AgnoModule {}
