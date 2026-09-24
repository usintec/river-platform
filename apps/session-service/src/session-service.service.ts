import { Injectable } from '@nestjs/common';

export interface SessionContext {
  sessionId: string;
  userId: string;
  tenantId: string;
  createdAt: string;
}

@Injectable()
export class SessionServiceService {
  private readonly sessions = new Map<string, SessionContext>();

  createSession(userId: string, tenantId: string): SessionContext {
    const sessionId = `session_${Date.now()}`;
    const session: SessionContext = {
      sessionId,
      userId,
      tenantId,
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): SessionContext | undefined {
    return this.sessions.get(sessionId);
  }
}
