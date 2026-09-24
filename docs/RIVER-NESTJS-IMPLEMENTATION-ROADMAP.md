# RIVER NestJS Implementation Roadmap

## 1. Goal

Convert the River multi-agent architecture into a working NestJS monorepo that is secure, observable, and extensible while preserving the current minimal app skeleton in the repo.

The current implementation already contains the entry point for the API gateway in:

- [apps/api-gateway/src/main.ts](../apps/api-gateway/src/main.ts)
- [apps/api-gateway/src/api-gateway.module.ts](../apps/api-gateway/src/api-gateway.module.ts)
- [apps/api-gateway/src/api-gateway.controller.ts](../apps/api-gateway/src/api-gateway.controller.ts)
- [apps/api-gateway/src/api-gateway.service.ts](../apps/api-gateway/src/api-gateway.service.ts)

This is a good starting point for the public boundary layer, but it needs to evolve into a real platform façade.

---

## 2. Delivery Principle

The implementation should follow the architecture rule from the formal spec:

> Agents are replaceable capability providers. They communicate through contracts, orchestration, and events rather than direct implementation-to-implementation dependencies.

In NestJS terms, this means:

- API Gateway handles external traffic
- Domain modules expose contracts and ports
- Services depend on interfaces, not on concrete agents
- Kafka is used for async event propagation
- Agent runtime state lives in orchestration boundaries, not inside direct business modules

---

## 3. Recommended Monorepo Structure

```text
apps/
  api-gateway/
    src/
      main.ts
      app.module.ts
      common/
        filters/
        interceptors/
        middleware/
        guards/
        pipes/
      modules/
        health/
        identity/
        sessions/
        routing/
        agents/
        actions/
        policy/
        events/
        observability/

libs/
  shared/
    src/
      config/
      constants/
      decorators/
      dto/
      logger/
      telemetry/
      types/
      utils/
  core/
    src/
      contracts/
      interfaces/
      events/
      errors/
      auth/
      correlation/
  agent-runtime/
    src/
      orchestration/
      state/
      graph/
      tools/
      contracts/
```

This keeps the public app slim while pushing reusable contracts and platform concerns into shared libraries.

---

## 4. Implementation Phases

## Phase 1 — Foundation and Platform Contracts

### Objective

Establish project conventions, shared types, config handling, and telemetry primitives before adding business features.

### Tasks

1. Create shared configuration for environment variables
   - APP_PORT
   - NODE_ENV
   - JWT_SECRET
   - KAFKA_BROKERS
   - POSTGRES_URL
   - REDIS_URL
   - OTEL_EXPORTER_OTLP_ENDPOINT

2. Add correlation metadata and request IDs
   - trace_id
   - request_id
   - user_id
   - session_id
   - tenant_id

3. Define base DTOs and API response envelopes
   - success/error wrapper
   - validation error format
   - pagination contract

4. Add shared logger and structured logging
   - log correlation IDs
   - log request path, method, latency, tenant, trace

5. Standardize exception filters and validation pipes
   - handle domain validation consistently
   - convert internal errors to clean API responses

### Deliverables

- config module
- shared logger
- correlation interceptor
- base DTOs
- error handling contract

---

## Phase 2 — API Gateway as the Public Boundary

### Objective

Turn the gateway from a hello-world controller into a true ingress layer.

### Tasks

1. Replace the placeholder route with health and platform endpoints
   - GET /health
   - GET /health/ready
   - GET /metrics/status or internal platform status

2. Add request context middleware
   - generate request_id
   - identify tenant and session from headers or auth token
   - attach correlation metadata to request object

3. Add rate limiting and request validation
   - whitelist or throttle based on client ID and route
   - validate payloads with class-validator DTOs

4. Add authentication handoff
   - verify JWT or session token
   - pass down principal to downstream services

5. Add routing strategy
   - command requests -> command router
   - conversation requests -> agent runtime
   - background jobs -> Kafka producer

### Suggested module layout

```text
api-gateway/
  src/
    app.module.ts
    modules/
      health/
        health.controller.ts
        health.service.ts
      routing/
        command-router.service.ts
        conversation-router.service.ts
      auth/
        auth.guard.ts
        current-user.decorator.ts
```

### Acceptance criteria

- Every request has a correlation ID
- Unauthorized requests are rejected before downstream calls
- Health endpoints return platform status
- API routes are separated by responsibility

---

## Phase 3 — Identity and Session Modules

### Objective

Separate identity data ownership from workflow and AI execution logic.

### Tasks

1. Create identity module
   - user profile lookup
   - tenant resolution
   - account status checks
   - permission snapshots

2. Create session module
   - create session
   - resume session
   - expire session
   - store conversational context metadata

3. Define identity/session contracts
   - IUserContext
   - ISessionContext
   - IPrincipal

4. Add authorization primitives
   - role-based access
   - tenant scope enforcement
   - consent gate checks

### Important rule

The API Gateway should not own the identity database or session store logic directly. It should delegate to authenticated service modules.

---

## Phase 4 — Agent Runtime Shell

### Objective

Create a runtime shell that supports replaceable agents while keeping orchestration logic independent from business implementations.

### Tasks

1. Define agent contracts
   - IAgent
   - IAgentCapability
   - AgentRequest
   - AgentResponse

2. Introduce runtime orchestrator
   - route request to selected agent
   - manage task state
   - track execution checkpoints
   - handle retries and cancellation

3. Make agent implementations pluggable
   - conversation agent
   - retrieval agent
   - action agent
   - policy agent

4. Add execution state management
   - state per workflow
   - checkpoint metadata
   - suspension/resume support

### Core design

```ts
export interface IAgent<TRequest, TResponse> {
  readonly name: string;
  readonly version: string;
  readonly capabilities: string[];
  execute(request: TRequest): Promise<TResponse>;
}
```

This keeps the system open to future implementation changes without breaking the orchestrator.

---

## Phase 5 — Retrieval and Knowledge Services

### Objective

Support graph + vector hybrid retrieval as described in the architecture.

### Tasks

1. Build retrieval module interfaces
   - document search
   - semantic retrieval
   - graph traversal
   - source ranking

2. Connect storage adapters
   - Postgres for relational metadata and app data
   - pgvector for embeddings and similarity search
   - Neo4j for graph relationships and entity context
   - Redis for cache/session acceleration

3. Add retrieval telemetry
   - latency
   - top queries
   - source hit rate
   - embedding quality metrics

4. Add retrieval policies
   - user access boundaries
   - tenant filtering
   - confidential content blocking

### Design boundary

The retrieval layer should not be embedded inside the agent implementation. It should be a reusable service behind a contract.

---

## Phase 6 — Action, Policy, and Consent Layer

### Objective

Make action execution governed and auditable.

### Tasks

1. Create action service module
   - execute approved actions
   - validate action payloads
   - track lifecycle state

2. Add consent and policy checks
   - confirm user permission
   - verify tenant policy
   - block disallowed actions

3. Add audit events
   - action created
   - action approved
   - action executed
   - action failed

4. Build plugin integration interface
   - internal API adapters
   - external connectors
   - data write boundaries

### Rule

No action should execute without policy approval and audit logging.

---

## Phase 7 — Kafka Event Backbone

### Objective

Introduce asynchronous event-driven behavior for ingestion, background work, and observability.

### Tasks

1. Add Kafka client infrastructure
   - producer wrapper
   - consumer wrapper
   - topic naming strategy
   - event schema versioning

2. Define event contracts
   - UserCreated
   - SessionStarted
   - AgentTaskCreated
   - RetrievalCompleted
   - ActionRequested
   - ActionExecuted
   - ModelInvoked
   - EvaluationTriggered

3. Add outbox or event publication pattern
   - write transactional event records
   - publish asynchronously to Kafka
   - avoid direct DB mutation by consumers

4. Add retry and dead-letter handling
   - exponential backoff
   - DLQ path for unrecoverable events

### Example event contract

```ts
export class AgentTaskCreatedEvent {
  readonly eventType = 'agent.task.created';
  readonly traceId: string;
  readonly requestId: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly agentId: string;
  readonly taskId: string;
  readonly timestamp: string;
}
```

---

## Phase 8 — Model Gateway Integration

### Objective

Provide capability-based access to model providers without hard-coding provider-specific logic in agents.

### Tasks

1. Define capability contracts
   - fast.conversation
   - deep.reasoning
   - structured.output
   - code_generation

2. Add model gateway service
   - select model based on capability and latency class
   - route streaming/non-streaming requests
   - maintain model metadata and versioning

3. Add provider adapters
   - OpenAI-like
   - other model providers
   - local/self-hosted options

4. Add cost, latency, and failure telemetry
   - model latency by route
   - fallback counts
   - provider failure rate

---

## Phase 9 — Observability and Reliability

### Objective

Make the platform operable in a production multi-agent environment.

### Tasks

1. Add OpenTelemetry tracing
   - HTTP requests
   - Kafka produce/consume
   - downstream agent execution
   - tool calls and retrieval calls

2. Add metrics with Prometheus
   - HTTP success/error rate
   - queue backlog
   - agent execution duration
   - retrieval latency
   - model latency

3. Add logs structured by correlation ID and tenant

4. Add dashboards in Grafana
   - request flow
   - platform health
   - agent performance
   - failure trends

---

## Phase 10 — Evaluation, MLOps, and Continuous Improvement

### Objective

Move beyond a reactive app and into a learning platform.

### Tasks

1. Add evaluation service
   - prompts
   - retrieval effectiveness
   - tool usage quality
   - action quality scoring

2. Add model registry support
   - versioned model metadata
   - rollback strategy
   - deployment status

3. Add retraining and feedback loop
   - collect approval/disapproval feedback
   - log tasks and outcomes
   - feed evaluation inputs back to future model improvements

4. Add monitoring hooks
   - drift detection
   - model quality regressions
   - action anomaly detection

---

## 5. Proposed NestJS Module Priorities for This Repo

Given the current repo state, the initial build order should be:

1. API Gateway foundation
2. Shared config, correlation, logging, errors
3. Health and routing modules
4. Identity and session contracts
5. Agent runtime shell and contracts
6. Retrieval service abstraction
7. Kafka integration
8. Policy and action execution
9. Observability stack
10. Model Gateway and evaluation services

This sequence avoids overbuilding before core boundaries are established.

---

## 6. Suggested Initial Sprint Breakdown

### Sprint 1 — Platform foundation

- gateway bootstrapping
- health endpoints
- request ID middleware
- structured logging
- config module
- validation + error handling

### Sprint 2 — Identity and routing

- auth guard
- principal context
- session service
- routing layer
- tenant-scoped request metadata

### Sprint 3 — Agent runtime skeleton

- agent contract interfaces
- orchestrator service
- task lifecycle states
- capability registry

### Sprint 4 — Kafka and background work

- producer and consumer wrappers
- event contracts
- retry and DLQ pipeline
- async workflow triggers

### Sprint 5 — Retrieval and tools

- retrieval abstraction
- knowledge service adapters
- policy gating for data access
- action service shell

### Sprint 6 — Observability and evaluation

- tracing
- Prometheus metrics
- Grafana/dashboard setup
- evaluation endpoints and reporting

---

## 7. Recommended First Delivery Scope

The very first implementation should not attempt the full platform at once. It should deliver:

- a working API Gateway
- correlation-aware requests
- health endpoints
- auth/session-contract layer
- pluggable agent runtime shell
- Kafka producer abstraction
- structured observability

This gives the platform a stable base for adding retrieval, policy enforcement, and model routing later.

---

## 8. Practical Next Steps for This Repo

1. Keep [apps/api-gateway/src/main.ts](../apps/api-gateway/src/main.ts) as the public bootstrap.
2. Create a module structure under the API Gateway for health, identity, sessions, and routing.
3. Add a shared libs folder for cross-cutting contracts and config.
4. Introduce the first event type and Kafka adapter.
5. Implement a capability-based agent interface before integrating model providers.
6. Add evaluation and tracing only after the request flow is stable.

---

## 9. Final Recommendation

The strongest technical implementation path for this repo is to ship the architecture in layers rather than as a single monolithic service. Start with the API gateway, request correlation, and agent contracts; then layer in retrieval, Kafka, governance, and observability. That sequence matches both the specification and the current NestJS structure.
