import { IsObject, IsOptional, IsString, MinLength } from "class-validator";
export class ExecuteAgentDto {
  @IsString() agent!: string;
  @IsString() @MinLength(1) input!: string;
  @IsObject() user!: {
    sub: string;
    email: string;
    roles: string[];
    sessionId?: string;
  };
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
  @IsOptional() @IsString() correlationId?: string;
  @IsOptional() @IsString() parentTaskId?: string;
}
