export interface PrincipalContract {
  userId: string;
  tenantId: string;
  roles?: string[];
}

export interface SessionContract {
  sessionId: string;
  userId: string;
  tenantId: string;
  createdAt: string;
}

export interface IdentityServiceClient {
  resolvePrincipal: (token?: string, context?: Record<string, unknown>) => Promise<PrincipalContract>;
}

export interface SessionServiceClient {
  createSession: (userId: string, tenantId: string) => Promise<SessionContract>;
}

export interface RoutingServiceClient {
  resolvePrincipal: IdentityServiceClient['resolvePrincipal'];
  createSession: SessionServiceClient['createSession'];
}
