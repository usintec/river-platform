import { ModelRequest, ModelResponse } from "../domain/contracts";
export abstract class ModelGateway {
  abstract complete(r: ModelRequest): Promise<ModelResponse>;
}
