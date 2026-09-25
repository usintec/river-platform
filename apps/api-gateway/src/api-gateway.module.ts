import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthService } from './auth/auth.service';
import { UserController } from './users/user.controller';
import { AuthController } from './auth/auth.controller';
import { InternalHttpService } from './common/internal-http.service';
import { RequestIdMiddleware } from './common/request-id.middleware';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ApiGatewayController, UserController, AuthController],
  providers: [ApiGatewayService, AuthService, InternalHttpService],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
