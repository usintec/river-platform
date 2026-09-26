import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Consumer, Kafka } from "kafkajs";
import { ExecutionService } from "../execution/execution.service";
import { ExecuteAgentDto } from "../execution/execution.dto";
@Injectable()
export class RuntimeKafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: `${process.env.KAFKA_CLIENT_ID ?? "river-agent-runtime"}-consumer`,
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  });
  private consumer: Consumer = this.kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID ?? "river-agent-runtime-workers",
  });
  constructor(private execution: ExecutionService) {}
  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: "river.task.created",
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value)
          await this.execution.execute(
            JSON.parse(message.value.toString()) as ExecuteAgentDto,
          );
      },
    });
  }
  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
