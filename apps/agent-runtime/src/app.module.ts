import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExecutionController } from "./execution/execution.controller";
import { ExecutionService } from "./execution/execution.service";
import { AgentRegistry } from "./agents/agent.registry";
import { GeneralAssistantAgent } from "./agents/general-assistant.agent";
import { PrismaService } from "./infra/prisma.service";
import { RedisService } from "./infra/redis.service";
import { KafkaService } from "./infra/kafka.service";
import { ModelGateway } from "./models/model.gateway";
import { MockModelGateway } from "./models/mock-model.gateway";
import { HttpModelGateway } from "./models/http-model.gateway";
import { RuntimeEvents } from "./observability/runtime-events";
import { InternalGuard } from "./security/internal.guard";
import { RuntimeKafkaConsumer } from "./transport/runtime-kafka.consumer";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ExecutionController],
  providers: [
    PrismaService,
    RedisService,
    KafkaService,
    RuntimeEvents,
    InternalGuard,
    AgentRegistry,
    GeneralAssistantAgent,
    ExecutionService,
    RuntimeKafkaConsumer,
    {
      provide: ModelGateway,
      inject: [MockModelGateway, HttpModelGateway],
      useFactory: (mock: MockModelGateway, http: HttpModelGateway) =>
        process.env.MODEL_GATEWAY_MODE === "http" ? http : mock,
    },
    MockModelGateway,
    HttpModelGateway,
  ],
})
export class AppModule {}
