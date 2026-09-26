import { Injectable } from "@nestjs/common";
import { ModelGateway } from "./model.gateway";
import { ModelRequest, ModelResponse } from "../domain/contracts";
@Injectable()
export class MockModelGateway extends ModelGateway {
  async complete(r: ModelRequest): Promise<ModelResponse> {
    return {
      model: "mock",
      text: `River mock model response for execution ${r.executionId}: ${r.messages.at(-1)?.content ?? ""}`,
    };
  }
}
