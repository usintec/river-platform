import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CorrelationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const requestId = req.headers['x-request-id'] || req.headers['x-trace-id'];

    if (requestId) {
      req.requestId = requestId;
      this.logger.log(`Request ${requestId} -> ${req.method} ${req.url}`);
    }

    return next.handle();
  }
}
