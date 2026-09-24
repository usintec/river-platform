import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export interface UserContext {
  sub: string;
  email: string;
  roles: string[];
  sessionId: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers?.authorization;

    if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    request.user = {
      sub: 'identity-service-user',
      email: 'user@local',
      roles: ['user'],
      sessionId: 'gateway-session-placeholder',
    } as UserContext;

    return true;
  }
}
