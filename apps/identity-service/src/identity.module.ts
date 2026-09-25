import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [IdentityController],
  providers: [IdentityService, PrismaService],
})
export class IdentityServiceModule {}
