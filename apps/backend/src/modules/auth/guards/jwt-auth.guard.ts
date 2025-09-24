import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  canActivate(context: ExecutionContext) {
    console.debug('🛡️ JwtAuthGuard.canActivate - Called');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.debug('🛡️ JwtAuthGuard.handleRequest - Called');
    console.debug('🛡️ JwtAuthGuard.handleRequest - err:', err);
    console.debug('🛡️ JwtAuthGuard.handleRequest - user:', user);
    console.debug('🛡️ JwtAuthGuard.handleRequest - info:', info);
    
    return super.handleRequest(err, user, info, context);
  }
}
