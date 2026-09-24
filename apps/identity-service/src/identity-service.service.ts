import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface Principal {
  userId: string;
  tenantId: string;
  roles: string[];
}

@Injectable()
export class IdentityServiceService {
  verifyToken(token: string): Principal {
    if (token === 'valid-token') {
      return {
        userId: 'demo-user',
        tenantId: 'demo-tenant',
        roles: ['user'],
      };
    }

    throw new UnauthorizedException('Invalid or expired token');
  }
}
