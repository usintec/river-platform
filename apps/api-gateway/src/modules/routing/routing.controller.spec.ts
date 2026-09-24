import { RoutingController } from './routing.controller';

describe('RoutingController', () => {
  it('returns identity context for a supplied principal', () => {
    const controller = new RoutingController();
    const request = {
      user: {
        userId: 'demo-user',
        tenantId: 'demo-tenant',
      },
    };

    const result = controller.getIdentityContext(request as any);

    expect(result.status).toBe('ok');
    expect(result.source).toBe('identity-service');
    expect(result.principal).toMatchObject({
      userId: 'demo-user',
      tenantId: 'demo-tenant',
    });
  });

  it('uses identity-service defaults when no principal is present', () => {
    const controller = new RoutingController();

    const result = controller.getIdentityContext({} as any);

    expect(result.principal).toMatchObject({
      userId: 'identity-service-user',
      tenantId: 'identity-service-tenant',
    });
    expect(result.source).toBe('identity-service');
  });
});
