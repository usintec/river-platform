import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AgentDefinition } from "../domain/contracts";
@Injectable()
export class AgentRegistry {
  private agents = new Map<string, AgentDefinition>();
  register(a: AgentDefinition) {
    if (this.agents.has(a.manifest.id))
      throw new ConflictException(`Agent already registered: ${a.manifest.id}`);
    this.agents.set(a.manifest.id, a);
  }
  get(id: string) {
    const a = this.agents.get(id);
    if (!a) throw new NotFoundException(`Unknown agent: ${id}`);
    return a;
  }
  list() {
    return [...this.agents.values()].map((a) => a.manifest);
  }
}
