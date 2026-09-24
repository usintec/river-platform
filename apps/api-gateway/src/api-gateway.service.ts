import { Injectable } from '@nestjs/common';
import { AppConfigService } from './common/config/app-config.service';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly appConfigService: AppConfigService) {}

  getHealth() {
    return {
      status: 'ok',
      service: this.appConfigService.config.serviceName,
      environment: this.appConfigService.config.nodeEnv,
      timestamp: new Date().toISOString(),
    };
  }
}
