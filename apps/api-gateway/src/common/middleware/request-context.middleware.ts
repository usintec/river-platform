import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] ?? randomUUID();
    const traceId = req.headers['x-trace-id'] ?? requestId;

    req.headers['x-request-id'] = requestId;
    req.headers['x-trace-id'] = traceId;

    res.setHeader('x-request-id', requestId);
    res.setHeader('x-trace-id', traceId);

    next();
  }
}
