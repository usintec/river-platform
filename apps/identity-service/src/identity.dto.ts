import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  password!: string;

  @IsString()
  @MinLength(2)
  displayName!: string;
}

export class VerifyCredentialsDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
