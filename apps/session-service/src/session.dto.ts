import { IsString, MinLength } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  userId!: string;

  @IsString()
  email!: string;

  @IsString()
  displayName!: string;

  @IsString()
  @MinLength(20)
  userAgent?: string;

  @IsString()
  ip?: string;
}

export class TokenDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
