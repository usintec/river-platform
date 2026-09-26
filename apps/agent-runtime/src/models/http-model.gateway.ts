import {
  Injectable,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from "@nestjs/common";
import axios from "axios";
import { ModelGateway } from "./model.gateway";
import { ModelRequest, ModelResponse } from "../domain/contracts";
@Injectable()
export class HttpModelGateway extends ModelGateway {
  async complete(r: ModelRequest): Promise<ModelResponse> {
    try {
      return (
        await axios.post<ModelResponse>(
          `${process.env.MODEL_GATEWAY_URL}/internal/models/complete`,
          r,
          {
            timeout: Number(process.env.MODEL_GATEWAY_TIMEOUT_MS ?? 30000),
            headers: {
              "x-internal-service-secret": process.env.INTERNAL_SERVICE_SECRET,
            },
          },
        )
      ).data;
    } catch (e: any) {
      if (e?.code === "ECONNABORTED")
        throw new GatewayTimeoutException("Model Gateway timed out");
      throw new ServiceUnavailableException("Model Gateway unavailable");
    }
  }
}
