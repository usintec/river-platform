import { Controller, Get } from '@nestjs/common';
import { SessionServiceService } from './session-service.service';

@Controller()
export class SessionServiceController {
  constructor(private readonly sessionServiceService: SessionServiceService) {}

  @Get()
  getHello(): string {
    return this.sessionServiceService.getHello();
  }
}
