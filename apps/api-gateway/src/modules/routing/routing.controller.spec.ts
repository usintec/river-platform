import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';

describe('RoutingController', () => {
  const createService = () =>
    new RoutingService({
      resolvePrincipal: async () => ({
        userId: 'demo-user',
        tenantId: 'demo-tenant',
        roles: ['user'],
      }),
      createSession: async (userId, tenantId) => ({
        sessionId: 'session_123',
        userId,
        tenantId,
        createdAt: new Date().toISOString(),
      }),
    });

  it('forwards identity context to the identity service contract', async () => {
    const controller = new RoutingController(createService());
    const request = {
      user: {
        userId: 'demo-user',
        tenantId: 'demo-tenant',
      },
    };

    const result = await controller.getIdentityContext(request as any);

    expect(result.status).toBe('ok');
    expect(result.source).toBe('identity-service');
    expect(result.principal).toMatchObject({
      userId: 'demo-user',
      tenantId: 'demo-tenant',
    });
  });

  it('forwards session creation to the session service contract', async () => {
    const controller = new RoutingController(createService());

    const result = await controller.createSessionForRequest({
      user: {
        userId: 'demo-user',
        tenantId: 'demo-tenant',
      },
    } as any);

    expect(result.status).toBe('ok');
    expect(result.session.sessionId).toBe('session_123');
    expect(result.session.userId).toBe('demo-user');
    expect(result.session.tenantId).toBe('demo-tenant');
  });
});
