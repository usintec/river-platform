import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { RoutingService } from './routing.service';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Get('identity-context')
  async getIdentityContext(
    @Req() req: Request & { user?: { userId: string; tenantId: string } },
  ) {
    const headers = req.headers ?? {};
    const token = headers.authorization?.toString();
    const principal = await this.routingService.resolvePrincipal(token, {
      requestId: headers['x-request-id'],
      path: req.originalUrl,
    });

    return {
      status: 'ok',
      principal,
      source: 'identity-service',
    };
  }

  @Get('session')
  async createSessionForRequest(
    @Req() req: Request & { user?: { userId: string; tenantId: string } },
  ) {
    const principal = req.user ?? {
      userId: 'identity-service-user',
      tenantId: 'identity-service-tenant',
    };

    const session = await this.routingService.createSession(
      principal.userId,
      principal.tenantId,
    );

    return {
      status: 'ok',
      session,
      source: 'session-service',
    };
  }
}
