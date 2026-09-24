import { IdentityServiceService } from './identity-service.service';

describe('IdentityServiceService', () => {
  it('verifies a valid token and returns a principal', () => {
    const service = new IdentityServiceService();

    expect(service.verifyToken('valid-token')).toMatchObject({
      userId: 'demo-user',
      tenantId: 'demo-tenant',
      roles: ['user'],
    });
  });

  it('rejects an invalid token', () => {
    const service = new IdentityServiceService();

    expect(() => service.verifyToken('invalid-token')).toThrow('Invalid or expired token');
  });
});
