import { Injectable } from "@nestjs/common";
import { KafkaService } from "../infra/kafka.service";
@Injectable()
export class RuntimeEvents {
  constructor(private kafka: KafkaService) {}
  started(p: unknown) {
    return this.kafka.emit("river.agent.execution.started", p);
  }
  completed(p: unknown) {
    return this.kafka.emit("river.agent.execution.completed", p);
  }
  failed(p: unknown) {
    return this.kafka.emit("river.agent.execution.failed", p);
  }
  cancelled(p: unknown) {
    return this.kafka.emit("river.agent.execution.cancelled", p);
  }
}
