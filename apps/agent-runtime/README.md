# River Agent Runtime

This is the execution plane for River's pluggable agents.

Owns: agent registry/manifests, execution lifecycle, LangGraph orchestration boundary, model-gateway abstraction, state/checkpoints, tools/actions contracts, cancellation/timeouts, Kafka execution, telemetry.

Does not own: authentication, sessions, task routing, model-provider credentials, policy/consent authority, knowledge graph ownership, frontend.

Flow:

Client -> API Gateway -> Task Router -> Agent Runtime -> LangGraph Supervisor -> Agent -> Model Gateway / Retrieval / Action.

For the first slice, HTTP is exposed so the runtime can be tested before Task Router exists. Kafka consumes `river.task.created`.

Run:

1. docker compose up -d
2. npm install
3. copy .env.example to .env
4. npx prisma generate
5. npx prisma migrate dev --name init
6. npm run start:dev

Test:
POST /internal/agent-runtime/executions
x-internal-service-secret: <secret>

{"agent":"general-assistant","input":"Explain River's agent runtime.","user":{"sub":"user-id","email":"user@example.com","roles":["user"],"sessionId":"session-id"},"metadata":{}}

The default MODEL_GATEWAY_MODE=mock allows testing without a model. In production the agent runtime calls only Model Gateway, never Ollama/vLLM/cloud providers directly.

Adding an agent means implementing AgentDefinition, providing a manifest, and registering it. Agents remain plugins inside the runtime rather than becoming microservices by default.

Next layers: Task Router, real LangGraph supervisor/checkpointing, Tool Registry, Policy/Consent client, Retrieval Planner, Action Engine, streaming, tracing/metrics, eval hooks, and model gateway routing.
