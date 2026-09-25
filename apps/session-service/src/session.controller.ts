import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalGuard } from './internal.guard';
import { CreateSessionDto, TokenDto } from './session.dto';
import { SessionService } from './session.service';

@Controller('internal/sessions')
@UseGuards(InternalGuard)
export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessions.create(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: any) {
    return this.sessions.refresh(dto.refreshToken);
  }

  @Post('revoke')
  revoke(@Body() dto: TokenDto) {
    return this.sessions.revoke(dto.refreshToken);
  }
}
