import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from "@nestjs/common";
import { ExecutionStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { AgentRegistry } from "../agents/agent.registry";
import { PrismaService } from "../infra/prisma.service";
import { RedisService } from "../infra/redis.service";
import { RuntimeEvents } from "../observability/runtime-events";
import { ExecuteAgentDto } from "./execution.dto";
@Injectable()
export class ExecutionService {
  private active = 0;
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private registry: AgentRegistry,
    private events: RuntimeEvents,
  ) {}
  async execute(dto: ExecuteAgentDto) {
    if (this.active >= Number(process.env.MAX_CONCURRENT_EXECUTIONS ?? 8))
      throw new BadRequestException("Agent runtime concurrency limit reached");
    const agent = this.registry.get(dto.agent),
      id = randomUUID(),
      correlationId = dto.correlationId ?? id;
    this.active++;
    await this.prisma.agentExecution.create({
      data: {
        id,
        userId: dto.user.sub,
        sessionId: dto.user.sessionId,
        agent: dto.agent,
        status: "QUEUED",
        input: { text: dto.input, metadata: dto.metadata ?? {} },
        correlationId,
        parentTaskId: dto.parentTaskId,
      },
    });
    await this.prisma.agentExecution.update({
      where: { id },
      data: { status: "RUNNING", startedAt: new Date() },
    });
    await this.events.started({
      executionId: id,
      correlationId,
      agent: dto.agent,
    });
    try {
      const result = await this.timeout(
        agent.execute({
          executionId: id,
          user: dto.user,
          input: dto.input,
          metadata: dto.metadata ?? {},
        }),
        Math.min(
          agent.manifest.maxExecutionMs,
          Number(process.env.EXECUTION_TIMEOUT_MS ?? 120000),
        ),
      );
      await this.prisma.agentExecution.update({
        where: { id },
        data: {
          status: "SUCCEEDED",
          output: result.output as any,
          completedAt: new Date(),
        },
      });
      await this.events.completed({
        executionId: id,
        correlationId,
        agent: dto.agent,
      });
      return {
        executionId: id,
        status: "SUCCEEDED",
        output: result.output,
        metadata: result.metadata,
      };
    } catch (e: any) {
      const timed = e?.message === "EXECUTION_TIMEOUT";
      await this.prisma.agentExecution.update({
        where: { id },
        data: {
          status: timed ? "TIMED_OUT" : "FAILED",
          error: { message: e?.message ?? "Execution failed" },
          completedAt: new Date(),
        },
      });
      await this.events.failed({
        executionId: id,
        correlationId,
        agent: dto.agent,
        error: e?.message ?? "Execution failed",
        timedOut: timed,
      });
      if (timed) throw new RequestTimeoutException("Agent execution timed out");
      throw e;
    } finally {
      this.active--;
    }
  }
  async get(id: string) {
    const x = await this.prisma.agentExecution.findUnique({ where: { id } });
    if (!x) throw new NotFoundException("Execution not found");
    return x;
  }
  async cancel(id: string) {
    const x = await this.get(id);
    if (![ExecutionStatus.QUEUED, ExecutionStatus.RUNNING].includes(x.status))
      return x;
    await this.redis.client.set(`cancel:${id}`, "1", "EX", 300);
    return this.prisma.agentExecution.update({
      where: { id },
      data: { status: "CANCELLED", completedAt: new Date() },
    });
  }
  private async timeout<T>(p: Promise<T>, ms: number) {
    let t: NodeJS.Timeout;
    try {
      return await Promise.race([
        p,
        new Promise<T>(
          (_, r) =>
            (t = setTimeout(() => r(new Error("EXECUTION_TIMEOUT")), ms)),
        ),
      ]);
    } finally {
      clearTimeout(t!);
    }
  }
}
