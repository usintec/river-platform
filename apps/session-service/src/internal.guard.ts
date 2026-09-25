import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.headers['x-internal-service-secret'] !== process.env.INTERNAL_SERVICE_SECRET) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
