import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(body: unknown) {
    return {
      ok: true,
      source: 'identity-service',
      payload: body,
    };
  }

  async login(body: unknown, userAgent?: string, ip?: string) {
    return {
      ok: true,
      source: 'identity-service',
      payload: {
        body,
        userAgent,
        ip,
      },
    };
  }

  refresh(refreshToken: string) {
    return {
      ok: true,
      source: 'session-service',
      refreshToken,
    };
  }

  logout(refreshToken: string) {
    return {
      ok: true,
      source: 'session-service',
      refreshToken,
    };
  }
}
