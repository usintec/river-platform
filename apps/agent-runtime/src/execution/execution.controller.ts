import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { InternalGuard } from "../security/internal.guard";
import { AgentRegistry } from "../agents/agent.registry";
import { ExecutionService } from "./execution.service";
import { ExecuteAgentDto } from "./execution.dto";
@Controller("internal/agent-runtime")
@UseGuards(InternalGuard)
export class ExecutionController {
  constructor(
    private execution: ExecutionService,
    private registry: AgentRegistry,
  ) {}
  @Post("executions") execute(
    @Body() dto: ExecuteAgentDto,
    @Headers("x-correlation-id") cid?: string,
  ) {
    return this.execution.execute({
      ...dto,
      correlationId: cid ?? dto.correlationId,
    });
  }
  @Get("agents") agents() {
    return this.registry.list();
  }
  @Get("executions/:id") get(@Param("id") id: string) {
    return this.execution.get(id);
  }
  @Post("executions/:id/cancel") cancel(@Param("id") id: string) {
    return this.execution.cancel(id);
  }
}
