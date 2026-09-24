import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class RiverLoggerService implements LoggerService {
  private static readonly formatContext = (context?: string) => context ?? 'ApiGateway';

  log(message: string, context?: string) {
    console.log(this.stringify('log', message, context));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(this.stringify('error', message, context, trace));
  }

  warn(message: string, context?: string) {
    console.warn(this.stringify('warn', message, context));
  }

  debug(message: string, context?: string) {
    console.debug(this.stringify('debug', message, context));
  }

  verbose(message: string, context?: string) {
    console.log(this.stringify('verbose', message, context));
  }

  private stringify(level: string, message: string, context?: string, trace?: string) {
    const payload = {
      level,
      message,
      context: RiverLoggerService.formatContext(context),
      timestamp: new Date().toISOString(),
      ...(trace ? { trace } : {}),
    };

    return JSON.stringify(payload);
  }
}
