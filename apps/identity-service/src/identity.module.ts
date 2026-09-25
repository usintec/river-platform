import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [IdentityController],
  providers: [IdentityService, PrismaService],
})
export class IdentityServiceModule {}
