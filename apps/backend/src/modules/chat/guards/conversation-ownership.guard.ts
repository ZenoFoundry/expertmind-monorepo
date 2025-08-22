import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';

@Injectable()
export class ConversationOwnershipGuard implements CanActivate {
  constructor(private readonly conversationService: ConversationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const conversationId = request.params.id;

    if (!user || !conversationId) {
      throw new ForbiddenException('Access denied');
    }

    try {
      await this.conversationService.validateOwnership(conversationId, user.id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('You do not have access to this conversation');
    }
  }
}
