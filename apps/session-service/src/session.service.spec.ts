import { SessionService } from './session.service';

describe('SessionService', () => {
	it('creates an access token from the session user context', () => {
		const jwt = {
			sign: jest.fn(() => 'access-token'),
		};
		const service = new SessionService({} as never, jwt as never);

		const token = (service as never as {
			accessToken: (user: unknown, sessionId: string) => string;
		}).accessToken(
			{
				userId: 'user-1',
				email: 'user@example.com',
				displayName: 'User',
				roles: ['user'],
			},
			'session-1',
		);

		expect(token).toBe('access-token');
		expect(jwt.sign).toHaveBeenCalledWith(
			{
				sub: 'user-1',
				email: 'user@example.com',
				roles: ['user'],
				sessionId: 'session-1',
			},
			{ expiresIn: expect.anything() },
		);
	});
});
