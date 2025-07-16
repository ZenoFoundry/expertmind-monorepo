import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OllamaController } from './controller/ollama.controller';
import { OllamaService } from './services/ollama.service';
import { ChatResponseMapper } from './mappers/chat-response.mapper';
import { GenerateResponseMapper } from './mappers/generate-response.mapper';

@Module({
  imports: [HttpModule],
  controllers: [OllamaController],
  providers: [
    OllamaService,
    ChatResponseMapper,
    GenerateResponseMapper,
  ],
  exports: [OllamaService],
})
export class OllamaModule {}
