import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "river-agent-runtime",
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  });
  readonly producer: Producer = this.kafka.producer();
  async onModuleInit() {
    await this.producer.connect();
  }
  async onModuleDestroy() {
    await this.producer.disconnect();
  }
  async emit(topic: string, value: unknown, key?: string) {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
          headers: { "schema-version": "1" },
        },
      ],
    });
  }
}
