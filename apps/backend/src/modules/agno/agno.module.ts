import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgnoService } from './services/agno.service';

@Module({
  imports: [HttpModule],
  providers: [AgnoService],
  exports: [AgnoService],
})
export class AgnoModule {}
