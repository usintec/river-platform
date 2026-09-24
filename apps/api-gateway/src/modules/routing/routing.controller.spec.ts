import { RoutingController } from './routing.controller';
import { SessionService } from '../sessions/session.service';

describe('RoutingController', () => {
  it('creates a session for a supplied principal', () => {
    const sessionService = new SessionService();
    const controller = new RoutingController(sessionService);
    const request = {
      user: {
        userId: 'demo-user',
        tenantId: 'demo-tenant',
      },
    };

    const result = controller.getSession(request as any);

    expect(result.status).toBe('ok');
    expect(result.session.userId).toBe('demo-user');
    expect(result.session.tenantId).toBe('demo-tenant');
    expect(result.principal).toMatchObject({
      userId: 'demo-user',
      tenantId: 'demo-tenant',
    });
  });

  it('uses identity-service defaults when no principal is present', () => {
    const sessionService = new SessionService();
    const controller = new RoutingController(sessionService);

    const result = controller.getSession({} as any);

    expect(result.principal).toMatchObject({
      userId: 'identity-service-user',
      tenantId: 'identity-service-tenant',
    });
    expect(result.session.userId).toBe('identity-service-user');
    expect(result.session.tenantId).toBe('identity-service-tenant');
  });
});
