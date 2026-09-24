import { Injectable } from '@nestjs/common';
import {
  PrincipalContract,
  RoutingServiceClient,
  SessionContract,
} from './routing.contract';

@Injectable()
export class RoutingService {
  constructor(private readonly clients: RoutingServiceClient) {}

  async resolvePrincipal(
    token?: string,
    context?: Record<string, unknown>,
  ): Promise<PrincipalContract> {
    return this.clients.resolvePrincipal(token, context);
  }

  async createSession(userId: string, tenantId: string): Promise<SessionContract> {
    return this.clients.createSession(userId, tenantId);
  }
}
