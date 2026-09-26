import { Injectable, OnModuleInit } from "@nestjs/common";
import { AgentDefinition, AgentInput, AgentResult } from "../domain/contracts";
import { AgentRegistry } from "./agent.registry";
import { ModelGateway } from "../models/model.gateway";
@Injectable()
export class GeneralAssistantAgent implements AgentDefinition, OnModuleInit {
  readonly manifest = {
    id: "general-assistant",
    version: "1.0.0",
    description: "General River reasoning agent",
    capabilities: ["reasoning", "conversation", "planning"],
    inputSchema: { type: "string" },
    outputSchema: { type: "string" },
    streaming: false,
    maxExecutionMs: 120000,
    tags: ["core", "general"],
  };
  constructor(
    private registry: AgentRegistry,
    private model: ModelGateway,
  ) {}
  onModuleInit() {
    this.registry.register(this);
  }
  async execute(i: AgentInput): Promise<AgentResult> {
    const r = await this.model.complete({
      executionId: i.executionId,
      model: i.metadata.model as string | undefined,
      system:
        "You are a River Platform agent. Follow authenticated context and platform policy. Never claim a tool executed unless it actually executed.",
      messages: [{ role: "user", content: i.input }],
      temperature: 0.2,
    });
    return { output: r.text, metadata: { model: r.model, usage: r.usage } };
  }
}
