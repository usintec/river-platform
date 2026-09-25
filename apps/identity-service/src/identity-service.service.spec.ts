import { BadRequestException } from '@nestjs/common';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  const service = new IdentityService({} as never);

  it('rejects a create request without an email', async () => {
    await expect(
      service.createUser({
        password: 'long-enough-password',
        displayName: 'Test User',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects credential verification without an email', async () => {
    await expect(
      service.verifyCredentials({ password: 'long-enough-password' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
