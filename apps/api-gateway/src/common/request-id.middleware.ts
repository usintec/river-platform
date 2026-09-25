import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(_request: Request, response: Response, next: NextFunction) {
    const requestId = response.req.headers['x-request-id']?.toString() ?? randomUUID();
    response.setHeader('x-request-id', requestId);
    next();
  }
}