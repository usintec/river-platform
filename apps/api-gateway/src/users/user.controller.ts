import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: any) {
    return {
      ok: true,
      source: 'identity-service',
      user: req.user,
    };
  }
}
