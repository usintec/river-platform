import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'crypto';
import { RedisService } from './redis.service';
import { CreateSessionDto } from './session.dto';

interface SessionRecord {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
  userAgent?: string;
  ip?: string;
  createdAt: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
  ) {}

  private accessToken(user: SessionRecord, sessionId: string) {
    const expiresIn = (process.env.ACCESS_TOKEN_TTL ?? '15m') as JwtSignOptions['expiresIn'];

    return this.jwt.sign({
      sub: user.userId,
      email: user.email,
      roles: user.roles,
      sessionId,
    }, { expiresIn });
  }

  private async saveSession(
    sessionId: string,
    user: SessionRecord,
    refreshToken: string,
  ) {
    const ttl = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 2592000);
    await this.redis.client.set(
      `session:${sessionId}`,
      JSON.stringify(user),
      'EX',
      ttl,
    );
    await this.redis.client.set(
      `refresh:${refreshToken}`,
      sessionId,
      'EX',
      ttl,
    );
  }

  async create(dto: CreateSessionDto) {
    const sessionId = randomUUID();
    const refreshToken = randomBytes(48).toString('base64url');

    const user: SessionRecord = {
      userId: dto.userId,
      email: dto.email,
      displayName: dto.displayName,
      roles: ['user'],
      userAgent: dto.userAgent,
      ip: dto.ip,
      createdAt: new Date().toISOString(),
    };

    await this.saveSession(sessionId, user, refreshToken);

    return {
      accessToken: this.accessToken(user, sessionId),
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.ACCESS_TOKEN_TTL ?? '15m',
      sessionId,
    };
  }

  async refresh(oldRefreshToken: string) {
    const sessionId = await this.redis.client.get(`refresh:${oldRefreshToken}`);
    if (!sessionId) throw new UnauthorizedException('Invalid refresh token');

    const raw = await this.redis.client.get(`session:${sessionId}`);
    if (!raw) throw new UnauthorizedException('Session expired');

    const user = JSON.parse(raw) as SessionRecord;

    // Rotation: the old refresh token becomes unusable.
    await this.redis.client.del(`refresh:${oldRefreshToken}`);

    const newRefreshToken = randomBytes(48).toString('base64url');
    await this.redis.client.set(
      `refresh:${newRefreshToken}`,
      sessionId,
      'EX',
      Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 2592000),
    );

    return {
      accessToken: this.accessToken(user, sessionId),
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.ACCESS_TOKEN_TTL ?? '15m',
      sessionId,
    };
  }

  async revoke(refreshToken: string) {
    const sessionId = await this.redis.client.get(`refresh:${refreshToken}`);
    if (sessionId) {
      await this.redis.client.del(`refresh:${refreshToken}`);
      await this.redis.client.del(`session:${sessionId}`);
    }
    return { revoked: true };
  }
}
