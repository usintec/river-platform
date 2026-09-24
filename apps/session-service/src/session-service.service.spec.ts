import { SessionServiceService } from './session-service.service';

describe('SessionServiceService', () => {
  it('creates a session for a valid principal', () => {
    const service = new SessionServiceService();

    const session = service.createSession('demo-user', 'demo-tenant');

    expect(session.userId).toBe('demo-user');
    expect(session.tenantId).toBe('demo-tenant');
    expect(session.sessionId).toContain('session_');
  });

  it('retrieves an existing session by id', () => {
    const service = new SessionServiceService();
    const session = service.createSession('demo-user', 'demo-tenant');

    expect(service.getSession(session.sessionId)).toMatchObject({
      userId: 'demo-user',
      tenantId: 'demo-tenant',
    });
  });
});
