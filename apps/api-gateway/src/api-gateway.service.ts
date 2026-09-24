import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiGatewayService {
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
