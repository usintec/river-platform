import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthService } from './auth/auth.service';
import { UserController } from './users/user.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  controllers: [ApiGatewayController, UserController, AuthController],
  providers: [ApiGatewayService, AuthService],
})
export class ApiGatewayModule {}
