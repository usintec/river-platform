import { Injectable } from '@nestjs/common';

export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: string;
  readonly serviceName: string;
  readonly requestIdHeader: string;
  readonly traceIdHeader: string;
}

@Injectable()
export class AppConfigService {
  get config(): AppConfig {
    return {
      port: Number(process.env.PORT ?? 3000),
      nodeEnv: process.env.NODE_ENV ?? 'development',
      serviceName: process.env.SERVICE_NAME ?? 'api-gateway',
      requestIdHeader: process.env.REQUEST_ID_HEADER ?? 'x-request-id',
      traceIdHeader: process.env.TRACE_ID_HEADER ?? 'x-trace-id',
    };
  }
}
