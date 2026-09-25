import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { CreateUserDto, VerifyCredentialsDto } from './identity.dto';
import { InternalGuard } from './internal.guard';

@Controller('internal')
@UseGuards(InternalGuard)
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.identity.createUser(dto);
  }

  @Post('auth/verify')
  verify(@Body() dto: VerifyCredentialsDto) {
    return this.identity.verifyCredentials(dto);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.identity.getUser(id);
  }
}
