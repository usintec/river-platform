import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
