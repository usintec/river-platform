import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AppConfigService } from './common/config/app-config.service';
import { CorrelationInterceptor } from './common/interceptors/correlation.interceptor';
import { HealthController } from './common/health/health.controller';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { RiverLoggerService } from './common/logger/river-logger.service';
import { RoutingController } from './modules/routing/routing.controller';
import { RoutingService } from './modules/routing/routing.service';

@Module({
  controllers: [ApiGatewayController, HealthController, RoutingController],
  providers: [
    ApiGatewayService,
    AppConfigService,
    RiverLoggerService,
    {
      provide: RoutingService,
      useValue: {
        resolvePrincipal: async () => ({
          userId: 'demo-user',
          tenantId: 'demo-tenant',
          roles: ['user'],
        }),
        createSession: async (userId: string, tenantId: string) => ({
          sessionId: 'session_123',
          userId,
          tenantId,
          createdAt: new Date().toISOString(),
        }),
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationInterceptor,
    },
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
