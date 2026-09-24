import { Module } from '@nestjs/common';
import { SessionServiceController } from './session-service.controller';
import { SessionServiceService } from './session-service.service';

@Module({
  imports: [],
  controllers: [SessionServiceController],
  providers: [SessionServiceService],
})
export class SessionServiceModule {}
