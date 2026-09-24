import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../sessions/session.service';

@Controller('routing')
export class RoutingController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('session')
  getSession(@Req() req: Request & { user?: { userId: string; tenantId: string } }) {
    const principal = req.user ?? {
      userId: 'identity-service-user',
      tenantId: 'identity-service-tenant',
    };

    const session = this.sessionService.createSession(
      principal.userId,
      principal.tenantId,
    );

    return {
      status: 'ok',
      session,
      principal,
    };
  }
}
