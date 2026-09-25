import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalHttpService } from '../common/internal-http.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: InternalHttpService,
    private readonly config: ConfigService,
  ) {}

  register(body: any) {
    return this.http.post(
      `${this.config.getOrThrow('IDENTITY_SERVICE_URL')}/internal/users`,
      body,
    );
  }

  async login(body: any, userAgent?: string, ip?: string) {
    const identity = await this.http.post<{
      userId: string;
      email: string;
      displayName: string;
    }>(
      `${this.config.getOrThrow('IDENTITY_SERVICE_URL')}/internal/auth/verify`,
      body,
    );

    return this.http.post(
      `${this.config.getOrThrow('SESSION_SERVICE_URL')}/internal/sessions`,
      {
        userId: identity.userId,
        email: identity.email,
        displayName: identity.displayName,
        userAgent,
        ip,
      },
    );
  }

  refresh(refreshToken: string) {
    return this.http.post(
      `${this.config.getOrThrow('SESSION_SERVICE_URL')}/internal/sessions/refresh`,
      { refreshToken },
    );
  }

  logout(refreshToken: string) {
    return this.http.post(
      `${this.config.getOrThrow('SESSION_SERVICE_URL')}/internal/sessions/revoke`,
      { refreshToken },
    );
  }
}
