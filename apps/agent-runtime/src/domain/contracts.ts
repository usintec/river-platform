export interface UserContext {
  sub: string;
  email: string;
  roles: string[];
  sessionId?: string;
}
export interface AgentManifest {
  id: string;
  version: string;
  description: string;
  capabilities: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  streaming: boolean;
  maxExecutionMs: number;
  tags: string[];
}
export interface AgentInput {
  executionId: string;
  user: UserContext;
  input: string;
  metadata: Record<string, unknown>;
}
export interface AgentResult {
  output: unknown;
  metadata?: Record<string, unknown>;
}
export interface AgentDefinition {
  manifest: AgentManifest;
  execute(input: AgentInput): Promise<AgentResult>;
}
export interface ModelRequest {
  executionId: string;
  model?: string;
  system?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}
export interface ModelResponse {
  text: string;
  model: string;
  usage?: Record<string, number>;
}
