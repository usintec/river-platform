import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('routing')
export class RoutingController {
  @Get('identity-context')
  getIdentityContext(@Req() req: Request & { user?: { userId: string; tenantId: string } }) {
    const principal = req.user ?? {
      userId: 'identity-service-user',
      tenantId: 'identity-service-tenant',
    };

    return {
      status: 'ok',
      principal,
      source: 'identity-service',
    };
  }
}
