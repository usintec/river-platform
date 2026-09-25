import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { RedisService } from './redis.service';
import { InternalGuard } from './internal.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [SessionController],
  providers: [SessionService, RedisService, InternalGuard],
})
export class AppModule {}
