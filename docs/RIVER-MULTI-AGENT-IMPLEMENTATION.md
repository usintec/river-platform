# RIVER-MULTI-AGENT-IMPLEMENTATION.md

## RIVER Multi-Agent AI Platform --- Formal Implementation Specification

**System:** River Social\
**Architecture:** Event-driven, stateful, concurrent multi-agent
platform\
**Primary orchestration:** LangGraph\
**Event backbone:** Apache Kafka\
**Operational databases:** PostgreSQL, pgvector, Neo4j, Redis\
**Container platform:** Docker/Kubernetes\
**Observability:** OpenTelemetry, Prometheus, Grafana, centralized logs\
**Model access:** Unified Model Gateway\
**ML lifecycle:** Training → Evaluation → Registry → Deployment →
Monitoring → Retraining

------------------------------------------------------------------------

## 1. Specification Status

This document converts the River Personal Intelligence Architecture into
an implementation-oriented module specification.

The source architecture establishes the major responsibilities and
boundaries: identity/session before the agent runtime; LangGraph as the
orchestration/state layer; Kafka as the event backbone; graph + vector
hybrid retrieval; governed action execution; a unified Model Gateway;
MLOps; continuous evaluation; and platform observability.

Where the source architecture does not prescribe a concrete class name,
table name, endpoint, directory layout, or implementation technology,
this document defines an implementation convention. Such items are
**proposed implementation details**, not claims that they were
explicitly specified in the source architecture.

The central architectural rule is:

> **Agents are replaceable capability providers. They communicate
> through contracts, orchestration, and events rather than direct
> implementation-to-implementation dependencies.**

------------------------------------------------------------------------

## 2. Global Architecture

``` text
                              ┌─────────────────────┐
                              │   React / Mobile    │
                              └──────────┬──────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │    API Gateway      │
                              │  TypeScript/NestJS  │
                              └──────────┬──────────┘
                                         │
                         ┌───────────────┼────────────────┐
                         ▼               ▼                ▼
                  Identity/Session   Command Router   Event Gateway
                         │               │                │
                         └───────────────┼────────────────┘
                                         ▼
                                      Kafka
                                         │
              ┌──────────────────────────┼─────────────────────────┐
              ▼                          ▼                         ▼
       Data Processing             Agent Runtime              Model Gateway
              │                     LangGraph                       │
       ┌──────┼──────┐          ┌─────┼──────┐          ┌──────────┼─────────┐
       ▼      ▼      ▼          ▼     ▼      ▼          ▼          ▼         ▼
   Postgres Neo4j pgvector   Knowledge Retrieval Planning      LLM       ML Models
       │      │      │          │     │      │                 │
       └──────┼──────┘          └─────┼──────┘                 │
              ▼                       ▼                        │
        Hybrid Retrieval        Action Graph                   │
                                      │                         │
                              Policy / Consent                  │
                                      │                         │
                              Action Execution                  │
                                      │                         │
                             Plugins / Internal APIs            │
                                      │                         │
                                  Audit Log                     │
                                      │                         │
                              Monitoring/Evaluation ◄────────────┘
```

## 2.1 Three Architectural Planes

### Intelligence Plane

-   Agent Runtime
-   specialized agents
-   LangGraph
-   hybrid retrieval
-   LLM reasoning
-   planning
-   action management

### Data Plane

-   Kafka
-   data processing
-   identity resolution
-   PostgreSQL
-   Neo4j
-   pgvector
-   embeddings
-   data quality
-   personal data graph

### Platform Plane

-   Model Gateway
-   MLOps
-   Kubernetes
-   CI/CD
-   security/IAM
-   observability
-   evaluation
-   traffic management

------------------------------------------------------------------------

## 3. Global Design Rules

### 3.1 Loose Coupling

A specialized agent MUST NOT import another specialized agent's internal
classes.

Allowed:

``` text
Agent A
  ↓
Agent SDK / Agent Contract
  ↓
Agent Runtime / Supervisor
  ↓
Agent B
```

Not allowed:

``` text
Agent A
  ───────direct import──────►
                         Agent B implementation
```

### 3.2 Capability-Based Model Access

Agents request capabilities, not vendor-specific models.

``` json
{
  "capability": "fast.conversation",
  "task": "generate_reply",
  "latency_class": "interactive",
  "stream": true
}
```

The Model Gateway decides which model/version/provider satisfies the
request.

### 3.3 State Ownership

-   Identity Service owns identity.
-   Session Service owns sessions.
-   Agent Runtime owns workflow execution state/checkpoints.
-   Data Processing owns ingestion/transformation state.
-   Retrieval Service owns retrieval execution and retrieval telemetry.
-   Model Gateway owns model routing metadata.
-   Action Service owns action lifecycle.
-   Policy Service owns policy/consent decisions.
-   Audit Service owns immutable audit records.
-   Evaluation Service owns evaluation runs and scores.

### 3.4 Event Ownership

Each event has one logical producer and many consumers.

Consumers MUST NOT mutate the producer's database directly.

### 3.5 Synchronous vs Asynchronous Communication

Use synchronous calls for:

-   authentication
-   interactive query routing
-   immediate retrieval
-   model streaming
-   policy checks
-   short-lived tool calls

Use Kafka for:

-   data ingestion
-   background enrichment
-   embedding generation
-   analytics
-   agent lifecycle events
-   model lifecycle events
-   long-running tasks
-   retries/deferred work
-   monitoring events

### 3.6 Request Correlation

Every request/event SHOULD carry:

``` text
trace_id
request_id
correlation_id
causation_id
user_id
session_id
conversation_id
tenant_id
agent_id
agent_version
model_id
model_version
```

------------------------------------------------------------------------

## 4. Module 01 --- API Gateway

### Module

`api-gateway`

### Purpose

Provide the public application boundary between River clients and
internal platform services.

### Responsibilities

-   HTTP API
-   WebSocket/SSE streaming
-   authentication handoff
-   request validation
-   rate limiting
-   request correlation
-   traffic classification
-   API versioning
-   command/query forwarding
-   streaming cancellation
-   response normalization

### Does NOT Own

-   user identity records
-   agent workflow state
-   model inference
-   business actions
-   long-term personal data
-   policy decisions

### Directory Structure

``` text
apps/api-gateway/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── guards/
│   ├── dto/
│   ├── streams/
│   ├── clients/
│   ├── interceptors/
│   ├── config/
│   └── main.ts
└── test/
```

### Files

``` text
main.ts
app.module.ts
controllers/chat.controller.ts
controllers/tasks.controller.ts
controllers/events.controller.ts
streams/response-stream.service.ts
middleware/correlation.middleware.ts
guards/auth.guard.ts
guards/rate-limit.guard.ts
clients/identity.client.ts
clients/task-router.client.ts
dto/chat-request.dto.ts
dto/task-request.dto.ts
```

### Classes

-   `ApiGatewayApplication`
-   `ChatController`
-   `TaskController`
-   `EventController`
-   `ResponseStreamService`
-   `CorrelationMiddleware`
-   `AuthGuard`
-   `RateLimitGuard`

### Interfaces

``` ts
interface ChatRequest {
  userId: string;
  sessionId: string;
  conversationId: string;
  message: string;
  stream?: boolean;
}

interface StreamEvent {
  type: "token" | "tool" | "status" | "error" | "complete";
  correlationId: string;
  payload: unknown;
}
```

### Database Tables

No primary business database.

Optional operational tables:

``` text
api_request_metrics
api_rate_limit_state
```

### Kafka Topics

Consumes:

``` text
agent.response.completed
agent.task.status
```

Produces:

``` text
api.request.accepted
api.request.cancelled
```

### API Endpoints

``` text
POST /v1/chat
POST /v1/tasks
GET  /v1/tasks/:taskId
POST /v1/tasks/:taskId/cancel
GET  /v1/stream/:correlationId
```

### Input Contract

``` json
{
  "message": "string",
  "sessionId": "uuid",
  "conversationId": "uuid",
  "stream": true
}
```

### Output Contract

Non-streaming:

``` json
{
  "requestId": "uuid",
  "status": "completed",
  "response": "string"
}
```

Streaming:

``` text
event: token
data: {"text":"..."}

event: complete
data: {"requestId":"..."}
```

### Dependencies

-   Identity Service
-   Session Service
-   Task Router
-   Agent Runtime
-   Redis
-   OpenTelemetry

### Events Produced

-   `api.request.accepted`
-   `api.request.cancelled`

### Events Consumed

-   `agent.response.completed`
-   `agent.task.status`

### Failure Strategy

-   reject malformed requests
-   fail fast on unavailable authentication
-   return `202` for accepted asynchronous work
-   return controlled `503` when critical downstream capacity is
    unavailable
-   cancel downstream execution when the client disconnects

### Retry Strategy

-   no blind retries for user-facing POST requests
-   idempotency keys for retriable commands
-   exponential backoff for internal service calls
-   bounded retry count

### Security

-   JWT/OIDC validation
-   TLS
-   request-size limits
-   abuse/rate limiting
-   tenant/user isolation
-   no raw secrets in logs

### Observability

Metrics:

-   request count
-   error rate
-   P50/P95/P99 latency
-   TTFT
-   stream duration
-   disconnect rate
-   active connections
-   rate-limit events

### Scaling Strategy

-   stateless horizontal scaling
-   Kubernetes HPA
-   connection-aware scaling for streaming
-   Redis-backed rate limiting
-   separate interactive and background traffic pools

### Tests

-   controller tests
-   authentication tests
-   rate-limit tests
-   streaming tests
-   cancellation tests
-   contract tests
-   load tests
-   WebSocket/SSE disconnect tests

------------------------------------------------------------------------

## 5. Module 02 --- Identity Service

### Module

`identity-service`

### Purpose

Establish the authenticated user identity and permissions context before
execution enters the agent runtime.

### Responsibilities

-   user identity
-   authentication integration
-   authorization claims
-   roles
-   permissions
-   service-to-service identity
-   token validation
-   identity resolution

### Does NOT Own

-   conversation state
-   agent state
-   personal knowledge graph
-   action execution
-   model selection

### Directory Structure

``` text
apps/identity-service/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── guards/
│   ├── repositories/
│   ├── policies/
│   └── dto/
└── test/
```

### Files

``` text
identity.controller.ts
identity.service.ts
identity.repository.ts
permission.service.ts
token.service.ts
identity-resolver.service.ts
```

### Classes

-   `IdentityController`
-   `IdentityService`
-   `IdentityResolver`
-   `PermissionService`
-   `TokenService`

### Interfaces

``` ts
interface UserIdentityContext {
  userId: string;
  tenantId?: string;
  roles: string[];
  permissions: string[];
  consentScope: string[];
}
```

### Database Tables

``` text
users
user_identities
roles
permissions
user_roles
role_permissions
consent_scopes
```

### Kafka Topics

Produces:

``` text
identity.created
identity.updated
permission.changed
consent.changed
```

Consumes:

``` text
user.registered
user.deleted
```

### API Endpoints

``` text
GET  /v1/identity/me
GET  /v1/identity/:userId
POST /v1/identity/resolve
GET  /v1/permissions
```

### Input Contract

Authenticated token + request context.

### Output Contract

``` json
{
  "userId": "uuid",
  "roles": [],
  "permissions": [],
  "consentScope": []
}
```

### Dependencies

-   PostgreSQL
-   OIDC/Auth provider
-   Redis
-   API Gateway

### Events Produced

-   `identity.created`
-   `identity.updated`
-   `permission.changed`
-   `consent.changed`

### Events Consumed

-   `user.registered`
-   `user.deleted`

### Failure Strategy

Authentication failure is fail-closed.

Authorization failure is fail-closed.

### Retry Strategy

Token introspection may retry transient provider failures, but
authorization decisions MUST NOT be silently retried into success.

### Security

-   OIDC/JWT
-   RBAC/ABAC
-   encryption at rest
-   encrypted service-to-service communication
-   least privilege

### Observability

-   authentication failures
-   authorization failures
-   token latency
-   identity resolution latency
-   permission cache hit rate

### Scaling Strategy

Stateless API workers + Redis cache + read replicas.

### Tests

-   JWT validation
-   role/permission matrix
-   consent scope
-   tenant isolation
-   revoked token
-   expired token
-   service identity tests

------------------------------------------------------------------------

## 6. Module 03 --- Session Service

### Module

`session-service`

### Purpose

Maintain session and conversation context independently from user
identity and agent execution workers.

### Responsibilities

-   sessions
-   conversations
-   message metadata
-   active conversation state
-   session expiration
-   conversation ownership
-   context references

### Does NOT Own

-   identity credentials
-   model inference
-   agent logic
-   long-term knowledge graph

### Directory Structure

``` text
apps/session-service/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dto/
│   └── policies/
└── test/
```

### Files

``` text
session.controller.ts
session.service.ts
conversation.service.ts
session.repository.ts
conversation.repository.ts
```

### Classes

-   `SessionController`
-   `SessionService`
-   `ConversationService`

### Interfaces

``` ts
interface SessionContext {
  sessionId: string;
  userId: string;
  conversationId: string;
  createdAt: string;
  expiresAt?: string;
}
```

### Database Tables

``` text
sessions
conversations
conversation_messages
conversation_metadata
```

### Kafka Topics

Produces:

``` text
session.created
session.closed
conversation.created
conversation.message.created
```

Consumes:

``` text
identity.deleted
```

### API Endpoints

``` text
POST /v1/sessions
GET  /v1/sessions/:sessionId
DELETE /v1/sessions/:sessionId
POST /v1/conversations
GET  /v1/conversations/:conversationId
POST /v1/conversations/:conversationId/messages
```

### Input Contract

User identity + session/conversation request.

### Output Contract

Session and conversation identifiers plus lifecycle metadata.

### Dependencies

-   PostgreSQL
-   Redis
-   Identity Service

### Events Produced

-   `session.created`
-   `session.closed`
-   `conversation.created`
-   `conversation.message.created`

### Events Consumed

-   `identity.deleted`

### Failure Strategy

Existing sessions remain recoverable from persistent storage.

### Retry Strategy

Database operations use bounded exponential retries for transient
failures.

### Security

User/session ownership is checked on every operation.

### Observability

-   active sessions
-   messages/session
-   session creation rate
-   conversation latency
-   storage errors

### Scaling Strategy

Stateless service + PostgreSQL read replicas + Redis.

### Tests

-   session lifecycle
-   ownership
-   expiration
-   concurrent messages
-   duplicate message handling
-   recovery tests

------------------------------------------------------------------------

## 7. Module 04 --- Command and Task Router

### Module

`task-router`

### Purpose

Translate incoming requests/events into executable tasks and route them
to the appropriate workflow or agent capability.

### Responsibilities

-   command classification
-   task creation
-   priority assignment
-   agent capability lookup
-   workload classification
-   synchronous/asynchronous routing
-   backpressure
-   queue selection

### Does NOT Own

-   agent implementation
-   model inference
-   database knowledge
-   final action authorization

### Directory Structure

``` text
apps/task-router/
├── src/
│   ├── router/
│   ├── registry/
│   ├── queues/
│   ├── policies/
│   ├── dto/
│   └── clients/
└── test/
```

### Files

``` text
task-router.service.ts
capability-registry.service.ts
priority.service.ts
queue-router.service.ts
task-classifier.service.ts
```

### Classes

-   `TaskRouter`
-   `CapabilityRegistry`
-   `PriorityClassifier`
-   `QueueRouter`
-   `TaskClassifier`

### Interfaces

``` ts
interface TaskRequest {
  taskId: string;
  userId: string;
  capability: string;
  priority: "P0" | "P1" | "P2" | "P3";
  payload: unknown;
  deadline?: string;
}
```

### Database Tables

``` text
task_records
routing_decisions
agent_capabilities
```

### Kafka Topics

Produces:

``` text
task.created
task.routed
task.cancelled
```

Consumes:

``` text
agent.registered
agent.unregistered
agent.capacity.changed
```

### API Endpoints

``` text
POST /v1/tasks/route
GET  /v1/tasks/:taskId
POST /v1/tasks/:taskId/cancel
GET  /v1/capabilities
```

### Input Contract

Task request with required capability and priority.

### Output Contract

``` json
{
  "taskId": "uuid",
  "route": "agent-runtime",
  "capability": "retrieval.hybrid",
  "priority": "P1"
}
```

### Dependencies

-   Agent Registry
-   Redis
-   Kafka
-   Agent Runtime

### Events Produced

-   `task.created`
-   `task.routed`
-   `task.cancelled`

### Events Consumed

-   `agent.registered`
-   `agent.capacity.changed`

### Failure Strategy

-   queue when capacity is temporarily unavailable
-   reject unsupported capabilities
-   degrade to a lower-cost capability where explicitly configured

### Retry Strategy

Queue-based retry with exponential backoff and dead-letter topic.

### Security

Capability authorization must be checked before routing.

### Observability

-   queue depth
-   routing latency
-   route failures
-   rejected tasks
-   task age
-   priority distribution

### Scaling Strategy

Partition queues by priority and capability.

### Tests

-   capability routing
-   priority routing
-   backpressure
-   cancellation
-   unknown capability
-   duplicate task

------------------------------------------------------------------------

## 8. Module 05 --- Agent Runtime

### Module

`agent-runtime`

### Purpose

Provide the stateful multi-agent execution environment using LangGraph.

### Responsibilities

-   workflow orchestration
-   graph execution
-   state management
-   checkpointing
-   supervisor coordination
-   concurrent agent execution
-   agent discovery
-   agent invocation
-   tool/model requests
-   human approval pauses
-   resume after failure

### Does NOT Own

-   specialized agent business logic
-   permanent identity data
-   model implementation
-   external action authorization
-   direct client authentication

### Directory Structure

``` text
apps/agent-runtime/
├── src/
│   ├── graph/
│   ├── supervisor/
│   ├── state/
│   ├── checkpoints/
│   ├── registry/
│   ├── execution/
│   ├── routing/
│   └── workers/
└── test/
```

### Files

``` text
runtime.ts
graph-builder.ts
supervisor.ts
agent-registry.ts
execution-engine.ts
state-manager.ts
checkpoint-manager.ts
parallel-executor.ts
resume.service.ts
```

### Classes

-   `AgentRuntime`
-   `GraphBuilder`
-   `AgentSupervisor`
-   `AgentRegistry`
-   `ExecutionEngine`
-   `StateManager`
-   `CheckpointManager`
-   `ParallelExecutor`

### Interfaces

``` ts
interface AgentManifest {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  inputSchema: string;
  outputSchema: string;
  requiredModels?: string[];
  requiredTools?: string[];
  supportsStreaming: boolean;
  supportsParallel: boolean;
  riskLevel: "low" | "medium" | "high";
}

interface AgentContext {
  userId: string;
  sessionId: string;
  conversationId: string;
  permissions: string[];
  consentScope: string[];
  stateRef: string;
  correlationId: string;
}

interface AgentTask {
  taskId: string;
  capability: string;
  input: unknown;
  deadline?: string;
}
```

### Database Tables

``` text
agent_executions
agent_checkpoints
agent_tasks
agent_registry
workflow_runs
workflow_state
```

### Kafka Topics

Produces:

``` text
agent.requested
agent.started
agent.completed
agent.failed
agent.cancelled
agent.checkpointed
```

Consumes:

``` text
task.routed
agent.completed
agent.failed
action.completed
```

### API Endpoints

``` text
POST /v1/agent-runs
GET  /v1/agent-runs/:runId
POST /v1/agent-runs/:runId/resume
POST /v1/agent-runs/:runId/cancel
GET  /v1/agents
GET  /v1/agents/:agentId
```

### Input Contract

``` json
{
  "taskId": "uuid",
  "userId": "uuid",
  "sessionId": "uuid",
  "conversationId": "uuid",
  "goal": "string",
  "context": {}
}
```

### Output Contract

``` json
{
  "runId": "uuid",
  "status": "completed",
  "answer": "string",
  "artifacts": [],
  "actions": []
}
```

### Dependencies

-   LangGraph
-   Redis
-   PostgreSQL
-   Kafka
-   Agent SDK
-   Retrieval Service
-   Model Gateway
-   Action Service
-   Policy Service

### Events Produced

-   `agent.requested`
-   `agent.started`
-   `agent.completed`
-   `agent.failed`
-   `agent.cancelled`
-   `agent.checkpointed`

### Events Consumed

-   `task.routed`
-   `agent.completed`
-   `agent.failed`
-   `action.completed`

### Failure Strategy

Persist checkpoint before long-running transitions.

A failed worker MUST NOT imply lost workflow state.

### Retry Strategy

Retry transient agent failures from the latest checkpoint.

Do not retry deterministic validation failures.

### Security

-   execution scoped to authenticated user
-   capability authorization
-   tool allowlists
-   state isolation
-   no unrestricted code execution

### Observability

-   graph execution latency
-   node latency
-   task success
-   checkpoint count
-   resume count
-   agent transition count
-   tokens
-   cost
-   tool calls

### Scaling Strategy

Stateless worker pool with externally persisted state.

Separate worker pools by workload class:

``` text
interactive
background
batch
high-risk
```

### Tests

-   graph execution
-   checkpoint/recovery
-   concurrent branches
-   cancellation
-   agent discovery
-   state isolation
-   deterministic replay
-   failure recovery
-   load tests

------------------------------------------------------------------------

## 9. Module 06 --- Data Processing

### Module

`data-processing`

### Purpose

Convert incoming River data/events into validated, normalized,
identity-linked, graph-ready and embedding-ready data.

### Responsibilities

``` text
Ingest
→ Validate
→ Normalize
→ Resolve Identity
→ CRUD
→ Apply Data Rules
→ Update Graph
→ Generate Embeddings
→ Update Vector Store
```

NLP is used for information extraction where required.

### Does NOT Own

-   agent reasoning
-   final model selection
-   workflow orchestration
-   user-facing API
-   action execution

### Directory Structure

``` text
apps/data-processing/
├── src/
│   ├── ingestion/
│   ├── validation/
│   ├── normalization/
│   ├── identity/
│   ├── extraction/
│   ├── graph/
│   ├── embeddings/
│   └── quality/
└── test/
```

### Files

``` text
ingestion.service.ts
validation.service.ts
normalization.service.ts
identity-resolution.service.ts
entity-extraction.service.ts
graph-writer.service.ts
embedding-publisher.service.ts
quality.service.ts
```

### Classes

-   `IngestionService`
-   `ValidationService`
-   `NormalizationService`
-   `IdentityResolutionService`
-   `EntityExtractionService`
-   `GraphWriter`
-   `EmbeddingPublisher`
-   `DataQualityService`

### Interfaces

``` ts
interface DataRecord {
  recordId: string;
  userId: string;
  source: string;
  timestamp: string;
  type: string;
  payload: unknown;
}

interface ExtractedEntity {
  entityId?: string;
  type: string;
  value: string;
  confidence: number;
}
```

### Database Tables

``` text
data_records
data_sources
data_quality_results
entity_resolution_results
processing_jobs
```

Graph entities are stored in Neo4j.

### Kafka Topics

Consumes:

``` text
user.event
content.created
content.updated
social.interaction.created
preference.changed
```

Produces:

``` text
data.validated
data.normalized
identity.resolved
entity.extracted
graph.updated
embedding.requested
data.quality.failed
```

### API Endpoints

``` text
POST /v1/data/ingest
GET  /v1/data/:recordId
GET  /v1/data/quality/:recordId
```

### Input Contract

Event envelope + domain payload.

### Output Contract

Normalized data record and processing status.

### Dependencies

-   Kafka
-   PostgreSQL
-   Neo4j
-   pgvector
-   Embedding Model via Model Gateway

### Events Produced

-   `data.validated`
-   `data.normalized`
-   `identity.resolved`
-   `entity.extracted`
-   `graph.updated`
-   `embedding.requested`
-   `data.quality.failed`

### Events Consumed

-   `user.event`
-   `content.created`
-   `content.updated`
-   `social.interaction.created`
-   `preference.changed`

### Failure Strategy

Invalid records are quarantined rather than silently discarded.

### Retry Strategy

Transient processing failures are retried.

Poison messages go to a dead-letter topic.

### Security

-   data classification
-   field-level access policy
-   encryption
-   tenant/user isolation
-   provenance tracking

### Observability

-   ingestion throughput
-   processing latency
-   data quality score
-   missingness
-   duplicate rate
-   schema violations
-   freshness
-   drift

### Scaling Strategy

Kafka partitioning + horizontally scaled consumers.

### Tests

-   schema validation
-   normalization
-   identity resolution
-   entity extraction
-   duplicate detection
-   ordering
-   DLQ behavior

------------------------------------------------------------------------

## 10. Module 07 --- Retrieval Service

### Module

`retrieval-service`

### Purpose

Provide graph, vector and hybrid retrieval to agents without exposing
storage implementation details to them.

### Responsibilities

-   query analysis
-   graph retrieval
-   vector retrieval
-   candidate fusion
-   reranking
-   recency weighting
-   source confidence
-   evidence construction
-   retrieval metrics

### Does NOT Own

-   LLM reasoning
-   agent planning
-   database schema ownership
-   action execution

### Directory Structure

``` text
apps/retrieval-service/
├── src/
│   ├── query/
│   ├── vector/
│   ├── graph/
│   ├── fusion/
│   ├── reranking/
│   ├── evidence/
│   └── metrics/
└── test/
```

### Files

``` text
retrieval.service.ts
query-analyzer.ts
vector-retriever.ts
graph-retriever.ts
candidate-fusion.ts
reranker.ts
evidence-builder.ts
retrieval-metrics.ts
```

### Classes

-   `RetrievalService`
-   `QueryAnalyzer`
-   `VectorRetriever`
-   `GraphRetriever`
-   `CandidateFusion`
-   `Reranker`
-   `EvidenceBuilder`

### Interfaces

``` ts
interface RetrievalRequest {
  query: string;
  userId: string;
  topK: number;
  filters?: Record<string, unknown>;
}

interface EvidenceItem {
  id: string;
  source: string;
  text?: string;
  entity?: unknown;
  score: number;
  timestamp?: string;
}
```

### Database Tables

Optional retrieval telemetry:

``` text
retrieval_queries
retrieval_results
retrieval_evaluations
```

Primary knowledge data remains in Neo4j/pgvector.

### Kafka Topics

Produces:

``` text
retrieval.completed
retrieval.failed
```

Consumes:

``` text
graph.updated
embedding.updated
```

### API Endpoints

``` text
POST /v1/retrieval/hybrid
POST /v1/retrieval/vector
POST /v1/retrieval/graph
POST /v1/retrieval/rerank
```

### Input Contract

Query + user context + retrieval constraints.

### Output Contract

``` json
{
  "queryId": "uuid",
  "evidence": [
    {
      "id": "entity-1",
      "source": "graph",
      "score": 0.91
    }
  ]
}
```

### Dependencies

-   Neo4j
-   PostgreSQL/pgvector
-   reranker through Model Gateway
-   Redis

### Events Produced

-   `retrieval.completed`
-   `retrieval.failed`

### Events Consumed

-   `graph.updated`
-   `embedding.updated`

### Failure Strategy

If one retrieval backend fails, the service may degrade to the available
backend when policy permits.

### Retry Strategy

Short bounded retries for transient database/network failures.

### Security

Every retrieval query is scoped by user/tenant authorization.

### Observability

-   Recall@K
-   Precision@K
-   MRR
-   NDCG
-   graph latency
-   vector latency
-   reranking latency
-   hybrid accuracy

### Scaling Strategy

Independent vector and graph read scaling; cache frequent queries.

### Tests

-   graph retrieval
-   vector retrieval
-   hybrid fusion
-   reranking
-   authorization filtering
-   empty evidence
-   backend degradation

------------------------------------------------------------------------

## 11. Module 08 --- Model Gateway

### Module

`model-gateway`

### Purpose

Provide one model access layer for LLMs, embedding models, classifiers,
recommendation models, vision models, graph ML and other model
capabilities.

### Responsibilities

-   model discovery
-   model selection
-   routing
-   versioning
-   provider abstraction
-   streaming
-   rate limiting
-   fallback
-   load balancing
-   cost control
-   model telemetry

### Does NOT Own

-   agent workflow
-   model training
-   business action authorization
-   user identity

### Directory Structure

``` text
apps/model-gateway/
├── src/
│   ├── registry/
│   ├── routing/
│   ├── providers/
│   ├── streaming/
│   ├── policies/
│   ├── fallback/
│   ├── caching/
│   └── metrics/
└── test/
```

### Files

``` text
model-gateway.service.ts
model-registry.service.ts
model-router.ts
provider-adapter.ts
stream-manager.ts
fallback.service.ts
cost-controller.ts
model-health.service.ts
```

### Classes

-   `ModelGateway`
-   `ModelRegistry`
-   `ModelRouter`
-   `ProviderAdapter`
-   `StreamManager`
-   `FallbackManager`
-   `CostController`
-   `ModelHealthService`

### Interfaces

``` ts
interface ModelRequest {
  capability: string;
  task: string;
  input: unknown;
  modelPreference?: string;
  stream?: boolean;
  latencyClass?: "interactive" | "background" | "batch";
}

interface ModelResponse {
  modelId: string;
  modelVersion: string;
  output: unknown;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    cost?: number;
  };
}
```

### Database Tables

``` text
model_registry
model_versions
model_routes
model_health
model_usage
model_costs
```

### Kafka Topics

Produces:

``` text
model.requested
model.completed
model.failed
model.updated
model.health.changed
```

Consumes:

``` text
model.deployed
model.retired
evaluation.completed
```

### API Endpoints

``` text
POST /v1/models/infer
POST /v1/models/stream
GET  /v1/models
GET  /v1/models/:modelId
GET  /v1/models/:modelId/health
```

### Input Contract

Capability-oriented request.

Example:

``` json
{
  "capability": "fast.conversation",
  "task": "reply",
  "stream": true,
  "input": {
    "messages": []
  }
}
```

### Output Contract

Streaming:

``` text
token → token → token → complete
```

Non-streaming:

``` json
{
  "modelId": "qwen3-4b",
  "modelVersion": "2507",
  "output": {},
  "usage": {}
}
```

### Dependencies

-   internal model servers
-   external model providers
-   Redis
-   model registry
-   observability

### Events Produced

-   `model.requested`
-   `model.completed`
-   `model.failed`
-   `model.updated`
-   `model.health.changed`

### Events Consumed

-   `model.deployed`
-   `model.retired`
-   `evaluation.completed`

### Failure Strategy

-   circuit breaker
-   fallback model
-   provider failover
-   timeout
-   request cancellation
-   graceful degradation

### Retry Strategy

Do not blindly retry streamed generation.

For idempotent non-streaming inference, bounded retry may be used.

### Security

-   provider credentials isolated
-   model access policies
-   request authorization
-   sensitive prompt handling
-   no secrets in prompts/logs

### Observability

-   TTFT
-   tokens/sec
-   request latency
-   queue time
-   model errors
-   token usage
-   cost
-   fallback rate
-   GPU utilization

### Scaling Strategy

-   model-specific worker pools
-   GPU node pools
-   request batching
-   priority scheduling
-   streaming
-   autoscaling
-   separate fast and reasoning model pools

### Tests

-   provider adapters
-   streaming
-   timeout
-   cancellation
-   fallback
-   model routing
-   load tests
-   token accounting
-   cost accounting

------------------------------------------------------------------------

## 12. Module 09 --- Action Execution

### Module

`action-service`

### Purpose

Convert approved plans into governed executable actions.

### Responsibilities

-   action graph
-   action scheduling
-   dependencies
-   execution
-   retries
-   compensation
-   tool/plugin invocation
-   action status
-   result capture

### Does NOT Own

-   LLM reasoning
-   final policy decisions
-   user identity
-   model training

### Directory Structure

``` text
apps/action-service/
├── src/
│   ├── actions/
│   ├── scheduler/
│   ├── executor/
│   ├── tools/
│   ├── plugins/
│   ├── compensation/
│   └── status/
└── test/
```

### Files

``` text
action.service.ts
action-graph.service.ts
scheduler.service.ts
executor.service.ts
tool-router.ts
plugin-router.ts
compensation.service.ts
```

### Classes

-   `ActionService`
-   `ActionGraph`
-   `ActionScheduler`
-   `ActionExecutor`
-   `ToolRouter`
-   `PluginRouter`
-   `CompensationManager`

### Interfaces

``` ts
interface Action {
  actionId: string;
  userId: string;
  type: string;
  parameters: Record<string, unknown>;
  priority: string;
  dependencies: string[];
  status: string;
  consentRequired: boolean;
  authorization?: unknown;
  result?: unknown;
}
```

### Database Tables

``` text
actions
action_dependencies
action_attempts
action_results
action_compensations
```

### Kafka Topics

Produces:

``` text
action.requested
action.started
action.completed
action.failed
action.cancelled
```

Consumes:

``` text
plan.created
policy.approved
policy.denied
```

### API Endpoints

``` text
POST /v1/actions
GET  /v1/actions/:actionId
POST /v1/actions/:actionId/cancel
GET  /v1/actions/:actionId/result
```

### Input Contract

Approved structured action.

### Output Contract

``` json
{
  "actionId": "uuid",
  "status": "completed",
  "result": {}
}
```

### Dependencies

-   Policy Service
-   Tool SDK
-   Plugin SDK
-   Kafka
-   PostgreSQL
-   Audit Service

### Events Produced

-   `action.requested`
-   `action.started`
-   `action.completed`
-   `action.failed`
-   `action.cancelled`

### Events Consumed

-   `plan.created`
-   `policy.approved`
-   `policy.denied`

### Failure Strategy

-   retry transient failures
-   compensate reversible actions
-   preserve action state
-   never silently repeat non-idempotent actions

### Retry Strategy

Per-action retry policy:

``` text
maxAttempts
backoff
timeout
retryableErrors
idempotencyKey
compensationAction
```

### Security

-   explicit authorization
-   tool allowlists
-   least privilege
-   action-level policy
-   secret isolation

### Observability

-   action success
-   action latency
-   retries
-   compensation rate
-   tool failures
-   queue time

### Scaling Strategy

Independent worker pools per action class.

### Tests

-   action dependency ordering
-   concurrent actions
-   idempotency
-   compensation
-   failure recovery
-   authorization

------------------------------------------------------------------------

## 13. Module 10 --- Policy and Consent

### Module

`policy-service`

### Purpose

Determine whether an intended action is permitted, requires consent, or
must be rejected.

### Responsibilities

-   policy evaluation
-   consent verification
-   risk classification
-   permission evaluation
-   action constraints
-   approval workflow

### Does NOT Own

-   action execution
-   model reasoning
-   identity credentials
-   audit storage

### Directory Structure

``` text
apps/policy-service/
├── src/
│   ├── policies/
│   ├── consent/
│   ├── risk/
│   ├── authorization/
│   └── rules/
└── test/
```

### Files

``` text
policy.service.ts
consent.service.ts
risk.service.ts
authorization.service.ts
policy-engine.ts
```

### Classes

-   `PolicyService`
-   `ConsentService`
-   `RiskService`
-   `AuthorizationService`
-   `PolicyEngine`

### Interfaces

``` ts
interface PolicyDecision {
  decision: "allow" | "deny" | "require_consent";
  reasons: string[];
  requiredScopes: string[];
}
```

### Database Tables

``` text
policies
policy_versions
consents
consent_history
risk_rules
```

### Kafka Topics

Produces:

``` text
policy.approved
policy.denied
consent.requested
consent.granted
consent.revoked
```

Consumes:

``` text
action.requested
identity.updated
consent.changed
```

### API Endpoints

``` text
POST /v1/policy/evaluate
GET  /v1/consent
POST /v1/consent
DELETE /v1/consent/:scope
```

### Input Contract

Action + identity + permissions + consent scope.

### Output Contract

Policy decision with reason codes.

### Dependencies

-   Identity Service
-   Session Service
-   PostgreSQL
-   Audit Service

### Events Produced

-   `policy.approved`
-   `policy.denied`
-   `consent.requested`
-   `consent.granted`
-   `consent.revoked`

### Events Consumed

-   `action.requested`
-   `identity.updated`
-   `consent.changed`

### Failure Strategy

Fail closed for consequential actions.

### Retry Strategy

Policy evaluation should be deterministic and fast; retry only
infrastructure failures.

### Security

-   policy integrity
-   signed policy versions
-   least privilege
-   explicit consent scopes

### Observability

-   allow/deny ratio
-   consent requests
-   policy latency
-   policy failures
-   high-risk actions

### Scaling Strategy

Stateless evaluation workers + cached policy snapshots.

### Tests

-   policy matrix
-   consent
-   risk rules
-   denial paths
-   policy versioning
-   fail-closed behavior

------------------------------------------------------------------------

## 14. Module 11 --- Audit and Provenance

### Module

`audit-service`

### Purpose

Provide durable traceability for actions, decisions, models, agents,
tools, data and consent.

### Responsibilities

Record:

``` text
who
what
when
why
agent
agent version
model
model version
tool
data
consent
result
```

### Does NOT Own

-   business state
-   action execution
-   policy evaluation
-   model inference

### Directory Structure

``` text
apps/audit-service/
├── src/
│   ├── ingestion/
│   ├── storage/
│   ├── query/
│   └── retention/
└── test/
```

### Files

``` text
audit.service.ts
audit-writer.ts
audit-query.service.ts
provenance.service.ts
retention.service.ts
```

### Classes

-   `AuditService`
-   `AuditWriter`
-   `AuditQueryService`
-   `ProvenanceService`
-   `RetentionService`

### Interfaces

``` ts
interface AuditRecord {
  auditId: string;
  userId: string;
  action?: string;
  agentId?: string;
  modelId?: string;
  modelVersion?: string;
  toolId?: string;
  consent?: unknown;
  result?: unknown;
  timestamp: string;
}
```

### Database Tables

``` text
audit_records
provenance_records
audit_events
```

### Kafka Topics

Consumes:

``` text
agent.completed
action.completed
action.failed
model.completed
policy.approved
policy.denied
```

Produces:

``` text
audit.recorded
```

### API Endpoints

``` text
GET /v1/audit/:auditId
GET /v1/audit/user/:userId
GET /v1/provenance/:entityId
```

### Input Contract

Audit event envelope.

### Output Contract

Immutable audit record identifier.

### Dependencies

-   PostgreSQL
-   Kafka
-   OpenTelemetry

### Events Produced

-   `audit.recorded`

### Events Consumed

-   agent/action/model/policy lifecycle events

### Failure Strategy

Audit writes should be durable. Critical audit events must not be
silently lost.

### Retry Strategy

Durable Kafka delivery + bounded storage retries + DLQ.

### Security

-   immutable access controls
-   encryption
-   privileged audit access
-   PII minimization
-   retention policies

### Observability

-   audit ingestion lag
-   write failure rate
-   event loss detection
-   storage growth

### Scaling Strategy

Append-oriented storage, partitioning and retention policies.

### Tests

-   event durability
-   immutability
-   provenance chain
-   authorization
-   retention

------------------------------------------------------------------------

## 15. Module 12 --- Evaluation and Monitoring

### Module

`evaluation-service`

### Purpose

Continuously measure system, data, retrieval, agent and model quality.

### Responsibilities

#### System

-   CPU
-   memory
-   GPU
-   latency
-   throughput
-   errors
-   availability
-   P95/P99

#### Data

-   missingness
-   duplicates
-   schema violations
-   freshness
-   drift
-   quality score

#### Retrieval

-   Recall@K
-   Precision@K
-   MRR
-   NDCG
-   graph latency
-   vector latency
-   hybrid accuracy

#### Agent

-   task success
-   tool selection accuracy
-   plan success
-   groundedness
-   hallucination
-   human escalation
-   action success
-   turns/task
-   latency
-   token usage
-   cost/task

### Does NOT Own

-   production inference
-   agent execution
-   model deployment
-   action execution

### Directory Structure

``` text
apps/evaluation-service/
├── src/
│   ├── collectors/
│   ├── evaluators/
│   ├── datasets/
│   ├── scorers/
│   ├── gates/
│   └── reports/
└── test/
```

### Files

``` text
evaluation.service.ts
metric-collector.ts
retrieval-evaluator.ts
agent-evaluator.ts
model-evaluator.ts
quality-gate.ts
report.service.ts
```

### Classes

-   `EvaluationService`
-   `MetricCollector`
-   `RetrievalEvaluator`
-   `AgentEvaluator`
-   `ModelEvaluator`
-   `QualityGate`
-   `ReportService`

### Interfaces

``` ts
interface EvaluationResult {
  evaluationId: string;
  targetId: string;
  targetVersion: string;
  metrics: Record<string, number>;
  passed: boolean;
  timestamp: string;
}
```

### Database Tables

``` text
evaluation_runs
evaluation_metrics
evaluation_datasets
quality_gates
evaluation_reports
```

### Kafka Topics

Produces:

``` text
evaluation.started
evaluation.completed
evaluation.failed
quality.gate.passed
quality.gate.failed
```

Consumes:

``` text
agent.completed
retrieval.completed
model.completed
action.completed
system.metric
data.quality.failed
```

### API Endpoints

``` text
POST /v1/evaluations
GET  /v1/evaluations/:evaluationId
GET  /v1/evaluations/:targetId
POST /v1/evaluations/:evaluationId/gate
```

### Input Contract

Evaluation target + dataset + metric configuration.

### Output Contract

Metrics + pass/fail gate + evidence.

### Dependencies

-   telemetry
-   model registry
-   datasets
-   MLflow/evaluation infrastructure

### Events Produced

-   `evaluation.started`
-   `evaluation.completed`
-   `evaluation.failed`
-   `quality.gate.passed`
-   `quality.gate.failed`

### Events Consumed

-   agent/model/retrieval/action/system/data events

### Failure Strategy

Evaluation failure must not be interpreted as model improvement.

### Retry Strategy

Retry evaluation jobs; preserve evaluation run IDs.

### Security

Evaluation datasets containing user data require restricted access.

### Observability

Evaluation job latency, throughput and score trends.

### Scaling Strategy

Distributed batch workers and parallel evaluators.

### Tests

-   metric correctness
-   regression detection
-   dataset versioning
-   quality gates
-   reproducibility

------------------------------------------------------------------------

## 16. Module 13 --- Notification Service

### Module

`notification-service`

### Purpose

Deliver user-visible asynchronous results and system notifications.

### Responsibilities

-   push notifications
-   in-app notifications
-   email/SMS integrations where enabled
-   notification preferences
-   delivery status
-   retry/dead-letter handling

### Does NOT Own

-   agent reasoning
-   policy decisions
-   action execution
-   user identity credentials

### Directory Structure

``` text
apps/notification-service/
├── src/
│   ├── channels/
│   ├── templates/
│   ├── preferences/
│   ├── delivery/
│   └── providers/
└── test/
```

### Files

``` text
notification.service.ts
delivery.service.ts
preference.service.ts
template.service.ts
providers/*.ts
```

### Classes

-   `NotificationService`
-   `DeliveryService`
-   `PreferenceService`
-   `TemplateService`

### Interfaces

``` ts
interface Notification {
  notificationId: string;
  userId: string;
  channel: string;
  template: string;
  payload: unknown;
  priority: string;
}
```

### Database Tables

``` text
notifications
notification_preferences
notification_deliveries
```

### Kafka Topics

Consumes:

``` text
task.completed
action.completed
agent.completed
notification.requested
```

Produces:

``` text
notification.sent
notification.failed
```

### API Endpoints

``` text
GET  /v1/notifications
POST /v1/notifications/:id/read
GET  /v1/notification-preferences
PUT  /v1/notification-preferences
```

### Input Contract

Notification event.

### Output Contract

Delivery status.

### Dependencies

-   Kafka
-   Redis
-   notification providers

### Events Produced

-   `notification.sent`
-   `notification.failed`

### Events Consumed

-   task/agent/action completion events

### Failure Strategy

Queue undelivered notifications.

### Retry Strategy

Provider-specific bounded retries with exponential backoff.

### Security

User preference and authorization checks.

### Observability

-   delivery rate
-   provider latency
-   failure rate
-   unread notifications
-   retry counts

### Scaling Strategy

Channel-specific worker pools.

### Tests

-   template rendering
-   preference filtering
-   provider failures
-   duplicate delivery
-   retry behavior

------------------------------------------------------------------------

# 17. Specialized Agent Modules

The following are independent capability providers. They implement the
Agent SDK contract and are registered with the Agent Runtime.

Common contract:

``` ts
interface Agent {
  manifest(): AgentManifest;
  initialize(context: AgentContext): Promise<void>;
  execute(
    task: AgentTask,
    context: AgentContext
  ): Promise<AgentResult>;
  shutdown(): Promise<void>;
}
```

No specialized agent should depend on another specialized agent's source
code.

------------------------------------------------------------------------

# 18. Agent 01 --- Knowledge Agent

### Module

`agents/knowledge-agent`

### Purpose

Interpret and manage personal knowledge/data-oriented tasks.

### Responsibilities

-   identify knowledge entities
-   request graph operations
-   summarize structured knowledge
-   identify relevant entities
-   provide knowledge evidence

### Does NOT Own

-   Neo4j infrastructure
-   vector database
-   retrieval implementation
-   model hosting

### Directory Structure

``` text
agents/knowledge-agent/
├── src/
│   ├── agent.ts
│   ├── prompts/
│   ├── schemas/
│   ├── tools/
│   └── evaluators/
└── test/
```

### Files

``` text
agent.ts
manifest.ts
knowledge.schema.ts
knowledge.tools.ts
prompts.ts
```

### Classes

-   `KnowledgeAgent`

### Interfaces

-   `Agent`
-   `KnowledgeTask`
-   `KnowledgeResult`

### Database Tables

None directly.

### Kafka Topics

Produces:

``` text
agent.knowledge.completed
```

Consumes:

``` text
task.created
graph.updated
```

### API Endpoints

Invoked through Agent Runtime.

### Input Contract

Knowledge task + user context.

### Output Contract

Structured entities/evidence.

### Dependencies

-   Agent SDK
-   Retrieval Service
-   Model Gateway

### Events Produced

`agent.knowledge.completed`

### Events Consumed

`task.created`, `graph.updated`

### Failure Strategy

Return structured failure; preserve workflow checkpoint.

### Retry Strategy

Retry transient retrieval/model failures.

### Security

User-scoped data access.

### Observability

Task latency, evidence count, groundedness.

### Scaling Strategy

Stateless worker replicas.

### Tests

Unit, contract, retrieval-groundedness and integration tests.

------------------------------------------------------------------------

# 19. Agent 02 --- Retrieval Agent

### Module

`agents/retrieval-agent`

### Purpose

Coordinate retrieval requests and return evidence to the supervisor.

### Responsibilities

-   formulate retrieval queries
-   choose retrieval mode
-   request hybrid retrieval
-   filter evidence
-   prepare evidence context

### Does NOT Own

-   Neo4j
-   pgvector
-   reranker implementation

### Directory Structure

``` text
agents/retrieval-agent/
├── src/
│   ├── agent.ts
│   ├── query/
│   ├── schemas/
│   └── evaluators/
└── test/
```

### Files

``` text
agent.ts
manifest.ts
query-builder.ts
evidence-schema.ts
```

### Classes

-   `RetrievalAgent`

### Interfaces

-   `RetrievalTask`
-   `EvidenceResult`

### Database Tables

None directly.

### Kafka Topics

Produces:

``` text
agent.retrieval.completed
```

Consumes:

``` text
task.created
```

### API Endpoints

Agent Runtime only.

### Input Contract

Query + retrieval constraints.

### Output Contract

Evidence set with provenance.

### Dependencies

Retrieval Service, Agent SDK, Model Gateway.

### Events Produced

`agent.retrieval.completed`

### Events Consumed

`task.created`

### Failure Strategy

Return empty/partial evidence with explicit confidence status.

### Retry Strategy

Bounded retry.

### Security

User-scoped retrieval.

### Observability

Recall, latency, evidence quality.

### Scaling Strategy

Horizontal worker scaling.

### Tests

Retrieval contract, authorization, evidence ranking.

------------------------------------------------------------------------

# 20. Agent 03 --- Planning Agent

### Module

`agents/planning-agent`

### Purpose

Convert goals and evidence into structured plans and action graphs.

### Responsibilities

-   goal decomposition
-   dependency identification
-   task planning
-   action graph generation
-   parallelization opportunities
-   model/tool capability selection

### Does NOT Own

-   action execution
-   policy approval
-   external API calls

### Directory Structure

``` text
agents/planning-agent/
├── src/
│   ├── agent.ts
│   ├── planners/
│   ├── schemas/
│   └── validators/
└── test/
```

### Files

``` text
agent.ts
planner.ts
plan.schema.ts
action-graph.schema.ts
validator.ts
```

### Classes

-   `PlanningAgent`
-   `PlanValidator`

### Interfaces

-   `Plan`
-   `PlanStep`
-   `ActionGraph`

### Database Tables

None directly.

### Kafka Topics

Produces:

``` text
plan.created
plan.failed
```

Consumes:

``` text
agent.retrieval.completed
```

### API Endpoints

Agent Runtime only.

### Input Contract

Goal + evidence + available capabilities.

### Output Contract

Validated plan/action graph.

### Dependencies

Model Gateway, Agent SDK, capability registry.

### Events Produced

`plan.created`, `plan.failed`

### Events Consumed

`agent.retrieval.completed`

### Failure Strategy

Reject invalid plans before action execution.

### Retry Strategy

Retry model failures; do not retry schema-invalid plans indefinitely.

### Security

Planning cannot bypass policy.

### Observability

Plan success rate, planning latency, tool-selection accuracy.

### Scaling Strategy

Stateless replicas.

### Tests

Plan schema, dependency ordering, parallelism, regression tests.

------------------------------------------------------------------------

# 21. Agent 04 --- Action Agent

### Module

`agents/action-agent`

### Purpose

Translate approved plans into requests for the Action Service.

### Responsibilities

-   prepare structured actions
-   identify required tools
-   provide action dependencies
-   request execution

### Does NOT Own

-   policy authorization
-   actual execution
-   credentials

### Directory Structure

``` text
agents/action-agent/
├── src/
│   ├── agent.ts
│   ├── schemas/
│   └── validators/
└── test/
```

### Files

``` text
agent.ts
manifest.ts
action-builder.ts
validator.ts
```

### Classes

-   `ActionAgent`
-   `ActionBuilder`

### Interfaces

-   `Action`
-   `ActionRequest`

### Database Tables

None directly.

### Kafka Topics

Produces:

``` text
action.requested
```

Consumes:

``` text
plan.created
policy.approved
```

### API Endpoints

Agent Runtime only.

### Input Contract

Validated plan.

### Output Contract

Structured action request.

### Dependencies

Action Service, Policy Service, Agent SDK.

### Events Produced

`action.requested`

### Events Consumed

`plan.created`, `policy.approved`

### Failure Strategy

Do not execute if action schema is invalid.

### Retry Strategy

Bounded retry.

### Security

No direct access to external credentials.

### Observability

Action preparation latency and validation failures.

### Scaling Strategy

Horizontal workers.

### Tests

Action schema, dependency graph, policy boundary tests.

------------------------------------------------------------------------

# 22. Agent 05 --- Recommendation Agent

### Module

`agents/recommendation-agent`

### Purpose

Support personalized River content and interaction recommendations.

### Responsibilities

-   candidate generation requests
-   recommendation context construction
-   ranking requests
-   personalization signals
-   recommendation explanation where appropriate

### Does NOT Own

-   feed storage
-   ranking model hosting
-   user authorization
-   moderation decisions

### Directory Structure

``` text
agents/recommendation-agent/
├── src/
│   ├── agent.ts
│   ├── candidate/
│   ├── ranking/
│   └── features/
└── test/
```

### Files

``` text
agent.ts
candidate.service.ts
ranking.service.ts
feature-builder.ts
```

### Classes

-   `RecommendationAgent`
-   `CandidateService`
-   `RankingService`

### Interfaces

-   `RecommendationRequest`
-   `RecommendationResult`

### Database Tables

No direct ownership; feature/recommendation telemetry may use:

``` text
recommendation_requests
recommendation_results
```

### Kafka Topics

Produces:

``` text
recommendation.generated
recommendation.feedback
```

Consumes:

``` text
social.interaction.created
preference.changed
content.created
```

### API Endpoints

``` text
POST /v1/recommendations
```

### Input Contract

User/context + candidate constraints.

### Output Contract

Ranked item IDs + scores + metadata.

### Dependencies

Model Gateway, Retrieval Service, Social Graph Agent/services.

### Events Produced

`recommendation.generated`, `recommendation.feedback`

### Events Consumed

social interaction and preference events.

### Failure Strategy

Fallback to cached/popularity-based recommendations.

### Retry Strategy

Bounded background retries.

### Security

Respect blocked/muted/private content.

### Observability

CTR, engagement, ranking latency, recommendation quality, feature
freshness.

### Scaling Strategy

Candidate generation and ranking independently scalable.

### Tests

Ranking correctness, filtering, personalization, load tests.

------------------------------------------------------------------------

# 23. Agent 06 --- Social Graph Agent

### Module

`agents/social-graph-agent`

### Purpose

Reason over relationships and social-network structure.

### Responsibilities

-   relationship queries
-   graph neighborhood requests
-   community/context analysis
-   relationship signals for personalization

### Does NOT Own

-   Neo4j infrastructure
-   authentication
-   final recommendations

### Directory Structure

``` text
agents/social-graph-agent/
├── src/
│   ├── agent.ts
│   ├── queries/
│   ├── graph/
│   └── schemas/
└── test/
```

### Files

``` text
agent.ts
graph-query.service.ts
relationship.service.ts
```

### Classes

-   `SocialGraphAgent`
-   `GraphQueryService`

### Interfaces

-   `GraphQuery`
-   `RelationshipResult`

### Database Tables

No direct relational ownership.

Graph data is stored in Neo4j.

### Kafka Topics

Produces:

``` text
social.graph.updated
```

Consumes:

``` text
social.interaction.created
user.followed
user.unfollowed
```

### API Endpoints

``` text
POST /v1/social-graph/query
```

### Input Contract

Graph query + user scope.

### Output Contract

Entities, relationships and graph-derived features.

### Dependencies

Retrieval Service / Neo4j abstraction.

### Events Produced

`social.graph.updated`

### Events Consumed

social relationship events.

### Failure Strategy

Return cached graph context when permitted.

### Retry Strategy

Transient graph-query retries.

### Security

Relationship visibility rules.

### Observability

Graph traversal latency, query volume, cache hit rate.

### Scaling Strategy

Read replicas/caching and partitioned workloads.

### Tests

Graph query, privacy, relationship visibility, performance.

------------------------------------------------------------------------

# 24. Agent 07 --- Content Agent

### Module

`agents/content-agent`

### Purpose

Support content creation, transformation and understanding.

### Responsibilities

-   drafting
-   summarization
-   rewriting
-   classification
-   metadata generation
-   content assistance

### Does NOT Own

-   final publishing authorization
-   moderation policy
-   user identity

### Directory Structure

``` text
agents/content-agent/
├── src/
│   ├── agent.ts
│   ├── generation/
│   ├── transformation/
│   ├── schemas/
│   └── validators/
└── test/
```

### Files

``` text
agent.ts
generation.service.ts
transform.service.ts
content.schema.ts
```

### Classes

-   `ContentAgent`
-   `ContentGenerationService`
-   `ContentTransformationService`

### Interfaces

-   `ContentRequest`
-   `ContentResult`

### Database Tables

Optional content-assistance telemetry:

``` text
content_generation_requests
```

### Kafka Topics

Produces:

``` text
content.generated
content.transformed
```

Consumes:

``` text
content.created
```

### API Endpoints

``` text
POST /v1/content/generate
POST /v1/content/transform
```

### Input Contract

Content intent + source material + constraints.

### Output Contract

Draft/content artifact + metadata.

### Dependencies

Model Gateway, Moderation Agent/service.

### Events Produced

`content.generated`, `content.transformed`

### Events Consumed

`content.created`

### Failure Strategy

Return partial result or controlled failure.

### Retry Strategy

Model retries only when request is idempotent.

### Security

Prompt/data isolation and content privacy.

### Observability

TTFT, generation latency, token usage, user acceptance.

### Scaling Strategy

Streaming generation and model-specific worker pools.

### Tests

Generation contract, streaming, safety integration, latency.

------------------------------------------------------------------------

# 25. Agent 08 --- Moderation Agent

### Module

`agents/moderation-agent`

### Purpose

Classify content and interactions for safety and policy workflows.

### Responsibilities

-   toxicity classification
-   spam classification
-   harmful-content detection
-   content risk scoring
-   moderation evidence

### Does NOT Own

-   final policy governance
-   account suspension
-   user identity
-   enforcement execution

### Directory Structure

``` text
agents/moderation-agent/
├── src/
│   ├── agent.ts
│   ├── classifiers/
│   ├── policies/
│   └── schemas/
└── test/
```

### Files

``` text
agent.ts
moderation.service.ts
classifier.ts
risk-score.ts
```

### Classes

-   `ModerationAgent`
-   `ModerationClassifier`
-   `RiskScorer`

### Interfaces

-   `ModerationRequest`
-   `ModerationResult`

### Database Tables

``` text
moderation_results
moderation_labels
```

### Kafka Topics

Produces:

``` text
content.moderated
moderation.flagged
```

Consumes:

``` text
content.created
content.updated
media.uploaded
```

### API Endpoints

``` text
POST /v1/moderation/check
```

### Input Contract

Content/media reference + context.

### Output Contract

Labels + risk score + confidence.

### Dependencies

Model Gateway, Policy Service.

### Events Produced

`content.moderated`, `moderation.flagged`

### Events Consumed

content/media events.

### Failure Strategy

High-risk paths fail closed or escalate according to policy.

### Retry Strategy

Bounded retry; DLQ for malformed content.

### Security

Restricted moderation data access.

### Observability

Precision/recall, false positives, false negatives, latency.

### Scaling Strategy

High-throughput classifier worker pool.

### Tests

Classification metrics, adversarial samples, regression, throughput.

------------------------------------------------------------------------

# 26. Agent 09 --- Search Agent

### Module

`agents/search-agent`

### Purpose

Translate user search intent into search/retrieval operations.

### Responsibilities

-   query understanding
-   query rewriting
-   search routing
-   result ranking
-   search explanation

### Does NOT Own

-   search indexes
-   graph database
-   vector database

### Directory Structure

``` text
agents/search-agent/
├── src/
│   ├── agent.ts
│   ├── query/
│   ├── ranking/
│   └── schemas/
└── test/
```

### Files

``` text
agent.ts
query-rewriter.ts
search-router.ts
ranker.ts
```

### Classes

-   `SearchAgent`
-   `QueryRewriter`
-   `SearchRouter`

### Interfaces

-   `SearchRequest`
-   `SearchResult`

### Database Tables

Search telemetry:

``` text
search_queries
search_clicks
```

### Kafka Topics

Produces:

``` text
search.completed
```

Consumes:

``` text
content.created
content.updated
```

### API Endpoints

``` text
POST /v1/search
```

### Input Contract

Search query + filters.

### Output Contract

Ranked results.

### Dependencies

Retrieval Service, Model Gateway.

### Events Produced

`search.completed`

### Events Consumed

content events.

### Failure Strategy

Fallback to lexical search.

### Retry Strategy

Bounded retries.

### Security

Visibility/privacy filters.

### Observability

Search latency, zero-result rate, CTR, ranking metrics.

### Scaling Strategy

Independent search worker scaling.

### Tests

Query rewriting, ranking, privacy filtering, load tests.

------------------------------------------------------------------------

# 27. Agent 10 --- Notification Agent

### Module

`agents/notification-agent`

### Purpose

Decide whether and how an event should result in a user notification.

### Responsibilities

-   notification relevance
-   timing
-   priority
-   channel recommendation
-   preference-aware generation

### Does NOT Own

-   notification delivery
-   provider credentials
-   final user consent

### Directory Structure

``` text
agents/notification-agent/
├── src/
│   ├── agent.ts
│   ├── ranking/
│   ├── preferences/
│   └── schemas/
└── test/
```

### Files

``` text
agent.ts
notification-ranker.ts
channel-selector.ts
```

### Classes

-   `NotificationAgent`
-   `NotificationRanker`
-   `ChannelSelector`

### Interfaces

-   `NotificationDecision`
-   `NotificationCandidate`

### Database Tables

None directly.

### Kafka Topics

Produces:

``` text
notification.requested
```

Consumes:

``` text
social.interaction.created
task.completed
action.completed
```

### API Endpoints

Agent Runtime only.

### Input Contract

Event + user notification preferences.

### Output Contract

Notification decision.

### Dependencies

Notification Service, Model Gateway.

### Events Produced

`notification.requested`

### Events Consumed

interaction/task/action events.

### Failure Strategy

Suppress rather than spam if decision confidence is insufficient.

### Retry Strategy

Retry background decisions.

### Security

Respect notification preferences and consent.

### Observability

Open rate, delivery rate, suppression rate, user feedback.

### Scaling Strategy

Event-driven worker pool.

### Tests

Preference handling, ranking, duplicate suppression.

------------------------------------------------------------------------

# 28. Agent 11 --- Trust and Safety Agent

### Module

`agents/trust-safety-agent`

### Purpose

Combine moderation, behavioral and graph signals for higher-level safety
risk assessment.

### Responsibilities

-   account risk analysis
-   coordinated behavior signals
-   spam/fraud signals
-   anomaly detection
-   escalation recommendations

### Does NOT Own

-   enforcement
-   account credentials
-   policy governance

### Directory Structure

``` text
agents/trust-safety-agent/
├── src/
│   ├── agent.ts
│   ├── risk/
│   ├── anomaly/
│   ├── graph/
│   └── schemas/
└── test/
```

### Files

``` text
agent.ts
risk-engine.ts
anomaly-detector.ts
graph-risk.service.ts
```

### Classes

-   `TrustSafetyAgent`
-   `RiskEngine`
-   `AnomalyDetector`
-   `GraphRiskService`

### Interfaces

-   `RiskAssessment`
-   `SafetySignal`

### Database Tables

``` text
risk_assessments
risk_signals
safety_cases
```

### Kafka Topics

Produces:

``` text
safety.risk.detected
safety.case.created
```

Consumes:

``` text
moderation.flagged
social.interaction.created
account.activity.created
```

### API Endpoints

``` text
POST /v1/trust-safety/assess
GET  /v1/trust-safety/cases/:caseId
```

### Input Contract

Behavior/content/graph signals.

### Output Contract

Risk score + evidence + recommended next step.

### Dependencies

Moderation, Social Graph, Model Gateway, Policy Service.

### Events Produced

`safety.risk.detected`, `safety.case.created`

### Events Consumed

moderation and activity events.

### Failure Strategy

Escalate uncertain high-risk cases according to policy.

### Retry Strategy

Background retry.

### Security

Highly restricted access.

### Observability

False positive/negative rates, case resolution time, model drift.

### Scaling Strategy

Streaming anomaly workers + batch analysis.

### Tests

Risk calibration, adversarial tests, graph anomaly tests.

------------------------------------------------------------------------

# 29. Agent 12 --- Analytics Agent

### Module

`agents/analytics-agent`

### Purpose

Provide analytical interpretation of River usage, engagement and system
outcomes.

### Responsibilities

-   metric analysis
-   trend detection
-   experiment analysis
-   user/product insights
-   operational summaries

### Does NOT Own

-   raw event ingestion
-   analytics warehouse
-   model deployment

### Directory Structure

``` text
agents/analytics-agent/
├── src/
│   ├── agent.ts
│   ├── metrics/
│   ├── analysis/
│   └── reports/
└── test/
```

### Files

``` text
agent.ts
metrics.service.ts
trend.service.ts
report.service.ts
```

### Classes

-   `AnalyticsAgent`
-   `MetricsService`
-   `TrendService`
-   `ReportService`

### Interfaces

-   `AnalyticsQuery`
-   `AnalyticsResult`

### Database Tables

Analytics data may be stored in a separate analytical store.

Operational metadata:

``` text
analytics_queries
analytics_reports
```

### Kafka Topics

Produces:

``` text
analytics.completed
```

Consumes:

``` text
*.completed
system.metric
```

### API Endpoints

``` text
POST /v1/analytics/query
GET  /v1/analytics/reports/:id
```

### Input Contract

Metric/query specification.

### Output Contract

Structured analytical result.

### Dependencies

Analytics store, Model Gateway, Evaluation Service.

### Events Produced

`analytics.completed`

### Events Consumed

system and lifecycle events.

### Failure Strategy

Return explicit data-quality warnings.

### Retry Strategy

Background retry.

### Security

Aggregated data access and privacy controls.

### Observability

Query latency, data freshness, report generation success.

### Scaling Strategy

Separate analytical compute from transactional services.

### Tests

Metric correctness, aggregation, data freshness, privacy.

------------------------------------------------------------------------

# 30. Cross-Cutting Package Modules

These packages are shared libraries/contracts, not independent business
services.

------------------------------------------------------------------------

## 30.1 `packages/agent-sdk`

### Purpose

Standard interface for all agents.

### Responsibilities

-   Agent interface
-   lifecycle
-   manifest
-   context
-   task/result types

### Does NOT Own

-   orchestration
-   agent business logic
-   persistence

### Directory Structure

``` text
packages/agent-sdk/
├── src/
│   ├── agent.ts
│   ├── manifest.ts
│   ├── context.ts
│   ├── task.ts
│   └── result.ts
└── test/
```

### Files

``` text
agent.ts
manifest.ts
context.ts
task.ts
result.ts
```

### Classes

Prefer interfaces and schemas; avoid stateful classes.

### Interfaces

-   `Agent`
-   `AgentManifest`
-   `AgentContext`
-   `AgentTask`
-   `AgentResult`

### Database Tables

None.

### Kafka Topics

None.

### API Endpoints

None.

### Input Contract

Agent lifecycle/task contract.

### Output Contract

Agent result contract.

### Dependencies

Schema validation library.

### Events Produced

None.

### Events Consumed

None.

### Failure Strategy

Contract validation.

### Retry Strategy

None; caller controls retry.

### Security

Schema-level validation.

### Observability

Correlation metadata definitions.

### Scaling Strategy

Library; no runtime scaling.

### Tests

Contract compatibility tests.

------------------------------------------------------------------------

## 30.2 `packages/event-contracts`

### Module

`event-contracts`

### Purpose

Versioned Kafka event schemas.

### Responsibilities

-   event envelope
-   schema versioning
-   compatibility
-   validation

### Does NOT Own

Kafka infrastructure or business processing.

### Directory Structure

``` text
packages/event-contracts/
├── src/
│   ├── envelope/
│   ├── events/
│   └── schemas/
└── test/
```

### Files

``` text
event-envelope.ts
agent-events.ts
action-events.ts
model-events.ts
data-events.ts
```

### Classes

Schema definitions only.

### Interfaces

``` ts
interface EventEnvelope<T> {
  eventId: string;
  eventType: string;
  schemaVersion: number;
  timestamp: string;
  producer: string;
  correlationId: string;
  causationId?: string;
  userId?: string;
  payload: T;
}
```

### Database Tables

None.

### Kafka Topics

Defines contracts for all platform topics.

### API Endpoints

None.

### Input Contract

Typed event.

### Output Contract

Validated versioned event.

### Dependencies

Schema validation.

### Events Produced

None directly.

### Events Consumed

None directly.

### Failure Strategy

Reject incompatible schemas.

### Retry Strategy

Caller controlled.

### Security

No secrets or unrestricted PII.

### Observability

Schema violation counts.

### Scaling Strategy

Library.

### Tests

Schema compatibility and serialization tests.

------------------------------------------------------------------------

## 30.3 `packages/model-sdk`

### Module

`model-sdk`

### Purpose

Standard model invocation interface.

### Responsibilities

-   capability request
-   streaming
-   usage metadata
-   cancellation
-   model result schema

### Does NOT Own

Model hosting or provider credentials.

### Directory Structure

``` text
packages/model-sdk/
├── src/
│   ├── model.ts
│   ├── request.ts
│   ├── response.ts
│   └── streaming.ts
└── test/
```

### Files

``` text
model.ts
request.ts
response.ts
streaming.ts
```

### Classes

-   `ModelClient`

### Interfaces

-   `ModelRequest`
-   `ModelResponse`
-   `ModelStreamEvent`

### Database Tables

None.

### Kafka Topics

None.

### API Endpoints

Client definitions for Model Gateway only.

### Input Contract

Capability-based model request.

### Output Contract

Structured or streamed response.

### Dependencies

HTTP/gRPC client.

### Events Produced

None.

### Events Consumed

None.

### Failure Strategy

Timeout/cancellation propagation.

### Retry Strategy

Caller controlled.

### Security

Service authentication.

### Observability

Correlation propagation.

### Scaling Strategy

Library.

### Tests

Contract, streaming, cancellation.

------------------------------------------------------------------------

## 30.4 `packages/retrieval-sdk`

### Module

`retrieval-sdk`

### Purpose

Hide Neo4j/pgvector implementation details from agents.

### Responsibilities

-   retrieval request
-   evidence schema
-   provenance
-   filters

### Does NOT Own

Graph/vector infrastructure.

### Directory Structure

``` text
packages/retrieval-sdk/
├── src/
│   ├── request.ts
│   ├── result.ts
│   └── provenance.ts
└── test/
```

### Files

``` text
request.ts
result.ts
provenance.ts
```

### Classes

None required.

### Interfaces

-   `RetrievalRequest`
-   `EvidenceItem`
-   `RetrievalResult`

### Database Tables

None.

### Kafka Topics

None.

### API Endpoints

Client contracts only.

### Input Contract

Query + filters + user scope.

### Output Contract

Evidence + provenance.

### Dependencies

None beyond schemas.

### Events Produced

None.

### Events Consumed

None.

### Failure Strategy

Contract errors fail fast.

### Retry Strategy

Caller controlled.

### Security

Mandatory user/tenant scope.

### Observability

Correlation metadata.

### Scaling Strategy

Library.

### Tests

Schema and compatibility tests.

------------------------------------------------------------------------

## 30.5 `packages/observability`

### Module

`observability`

### Purpose

Standardize logs, traces and metrics across every service and agent.

### Responsibilities

-   OpenTelemetry
-   structured logging
-   trace context
-   metrics
-   correlation IDs
-   model/agent/tool metadata

### Does NOT Own

-   monitoring dashboards
-   business metrics definitions

### Directory Structure

``` text
packages/observability/
├── src/
│   ├── tracing/
│   ├── logging/
│   ├── metrics/
│   └── correlation/
└── test/
```

### Files

``` text
tracing.ts
logger.ts
metrics.ts
correlation.ts
```

### Classes

-   `RiverLogger`
-   `Telemetry`
-   `MetricsRegistry`

### Interfaces

``` ts
interface ObservabilityContext {
  traceId: string;
  requestId: string;
  correlationId: string;
  userId?: string;
  agentId?: string;
  modelId?: string;
  modelVersion?: string;
}
```

### Database Tables

None.

### Kafka Topics

Metrics/events may be exported through the platform telemetry pipeline.

### API Endpoints

None.

### Input Contract

Application telemetry.

### Output Contract

Structured telemetry.

### Dependencies

OpenTelemetry, Prometheus-compatible metrics.

### Events Produced

Telemetry events where configured.

### Events Consumed

None.

### Failure Strategy

Observability failure must not normally stop business processing.

### Retry Strategy

Buffered asynchronous export.

### Security

PII redaction and secret filtering.

### Observability

This package provides observability.

### Scaling Strategy

Asynchronous telemetry export.

### Tests

Trace propagation, redaction, metric emission.

------------------------------------------------------------------------

# 31. Social AI Model Ecosystem

The Model Gateway should expose models by capability rather than
allowing agents to hard-code providers.

## 31.1 Conversational Models

Example capability classes:

``` text
fast.conversation
general.conversation
complex.reasoning
structured.generation
```

The initial deployment can use lightweight open-weight models for
interactive workloads and reserve larger reasoning models for tasks that
justify their latency.

For River's real-time experience, streaming is a first-class
requirement:

``` text
Client
  ↓
API Gateway
  ↓
Model Gateway
  ↓
Model Server
  ↓
token stream
  ↓
API Gateway
  ↓
React/Mobile
```

## 31.2 Embedding Models

``` text
text.embedding
multimodal.embedding
social-graph.embedding
```

## 31.3 Reranking Models

``` text
cross-encoder.reranker
query-relevance.ranker
```

## 31.4 Recommendation Models

``` text
candidate-generation
two-tower
learning-to-rank
graph-recommendation
session-recommendation
```

## 31.5 Trust and Safety Models

``` text
toxicity
spam
scam/fraud
bot detection
NSFW
violence
fake engagement
anomaly detection
account risk
```

## 31.6 Vision Models

``` text
image classification
object detection
OCR
image embedding
captioning
visual moderation
```

## 31.7 Audio Models

``` text
speech-to-text
text-to-speech
audio classification
voice moderation
```

## 31.8 Video Models

``` text
video embedding
action recognition
video moderation
video classification
video summarization
```

## 31.9 Graph ML

``` text
node embeddings
GraphSAGE
GAT
link prediction
community detection
graph anomaly detection
```

------------------------------------------------------------------------

# 32. Agent Communication Specification

## 32.1 Synchronous Agent Request

Used for interactive LangGraph execution.

``` json
{
  "messageId": "uuid",
  "sender": "supervisor",
  "recipient": "retrieval-agent",
  "type": "retrieval.request",
  "version": 1,
  "correlationId": "uuid",
  "causationId": "uuid",
  "priority": "P1",
  "context": {
    "userId": "uuid",
    "sessionId": "uuid",
    "conversationId": "uuid"
  },
  "payload": {}
}
```

## 32.2 Asynchronous Agent Event

``` json
{
  "eventId": "uuid",
  "eventType": "agent.completed",
  "schemaVersion": 1,
  "timestamp": "ISO-8601",
  "producer": "retrieval-agent",
  "correlationId": "uuid",
  "causationId": "uuid",
  "userId": "uuid",
  "payload": {}
}
```

## 32.3 Communication Rules

1.  Agents may publish events.
2.  Agents may consume events.
3.  Agents may request capabilities through the Agent Runtime.
4.  Agents MUST NOT access another agent's private database.
5.  Agents MUST NOT depend on another agent's source code.
6.  Long-running tasks SHOULD use Kafka.
7.  Interactive workflows SHOULD use LangGraph-mediated calls.
8.  Every message MUST be traceable.

------------------------------------------------------------------------

# 33. Kafka Topic Taxonomy

## Identity

``` text
identity.created
identity.updated
permission.changed
consent.changed
```

## Session

``` text
session.created
session.closed
conversation.created
conversation.message.created
```

## Data

``` text
user.event
data.validated
data.normalized
identity.resolved
entity.extracted
graph.updated
embedding.requested
embedding.updated
data.quality.failed
```

## Task

``` text
task.created
task.routed
task.cancelled
task.completed
```

## Agent

``` text
agent.requested
agent.started
agent.completed
agent.failed
agent.cancelled
agent.checkpointed
agent.registered
agent.unregistered
```

## Retrieval

``` text
retrieval.completed
retrieval.failed
```

## Planning

``` text
plan.created
plan.failed
```

## Action

``` text
action.requested
action.started
action.completed
action.failed
action.cancelled
```

## Policy

``` text
policy.approved
policy.denied
consent.requested
consent.granted
consent.revoked
```

## Model

``` text
model.requested
model.completed
model.failed
model.updated
model.health.changed
model.deployed
model.retired
```

## Evaluation

``` text
evaluation.started
evaluation.completed
evaluation.failed
quality.gate.passed
quality.gate.failed
```

## Notification

``` text
notification.requested
notification.sent
notification.failed
```

------------------------------------------------------------------------

# 34. Traffic Management

## Request Classes

``` text
P0 — critical/security
P1 — interactive user request
P2 — background agent work
P3 — batch/training/evaluation
```

## Flow

``` text
API Gateway
   │
   ├── authentication
   ├── rate limiting
   ├── priority
   ├── timeout
   └── circuit breaker
           │
           ▼
      Task Router
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
    P1    P2    P3
     │     │     │
     ▼     ▼     ▼
 interactive background batch
 worker    worker   worker
```

## Backpressure

When downstream capacity is exhausted:

1.  stop accepting unnecessary work;
2.  queue background tasks;
3.  preserve interactive capacity;
4.  shed low-priority work;
5.  return explicit overload status;
6.  expose queue depth through telemetry.

------------------------------------------------------------------------

# 35. Streaming Architecture

Streaming is required for interactive AI responses.

``` text
React/Mobile
     │
     │ SSE/WebSocket
     ▼
API Gateway
     │
     ▼
Agent Runtime
     │
     ▼
Model Gateway
     │
     ▼
Model Server
     │
     │ token 1
     │ token 2
     │ token 3
     ▼
Agent Runtime
     │
     ▼
API Gateway
     │
     ▼
Client
```

Requirements:

-   stream tokens as they become available;
-   propagate cancellation;
-   do not wait for full generation before returning the first token;
-   preserve trace/correlation IDs;
-   terminate streams cleanly;
-   record TTFT and generation throughput.

------------------------------------------------------------------------

# 36. State Management

State is external to agent workers.

``` text
User
 ↓
Session
 ↓
Conversation
 ↓
Workflow State
 ↓
Agent State
 ↓
Checkpoint
 ↓
Action State
```

Minimum workflow state:

``` ts
interface WorkflowState {
  runId: string;
  userId: string;
  sessionId: string;
  conversationId: string;
  goal: string;
  messages: unknown[];
  context: unknown;
  evidence: unknown[];
  plan?: unknown;
  actions?: unknown[];
  results?: unknown[];
  status: string;
  checkpointId?: string;
}
```

Workers may terminate without destroying workflow state.

This permits:

-   resume;
-   migration;
-   horizontal scaling;
-   failure recovery;
-   long-running workflows;
-   concurrent execution.

------------------------------------------------------------------------

# 37. Action Lifecycle

``` text
Goal
 ↓
Plan
 ↓
Action Graph
 ↓
Policy / Consent
 ↓
Authorization
 ↓
Schedule
 ↓
Execute
 ↓
Observe
 ↓
Retry / Compensate
 ↓
Complete
 ↓
Audit
 ↓
Update State
```

An LLM may propose an action, but it MUST NOT be treated as the
authorization boundary.

------------------------------------------------------------------------

# 38. Hybrid Retrieval

The retrieval service implements:

``` text
Query
 ├──────────────► Vector Search
 │
 └──────────────► Graph Search
                    │
                    ▼
              Candidate Fusion
                    │
                    ▼
                 Rerank
                    │
                    ▼
                 Evidence
```

A configurable score can combine:

``` text
HybridScore =
    α(VectorScore)
  + β(GraphScore)
  + γ(Recency)
  + δ(SourceConfidence)
```

The exact coefficients are deployment/evaluation parameters.

The LLM receives the resulting evidence rather than directly querying
the databases.

------------------------------------------------------------------------

# 39. Unified Model Routing

Agents request capabilities:

``` text
fast.conversation
general.conversation
complex.reasoning
text.embedding
reranking
recommendation
moderation
vision
audio
video
graph-ml
```

The Model Gateway performs:

``` text
Capability
   ↓
Model Registry
   ↓
Health
   ↓
Latency Class
   ↓
Cost
   ↓
Policy
   ↓
Model Selection
   ↓
Inference
```

This allows models to be replaced without rewriting agents.

------------------------------------------------------------------------

# 40. MLOps Lifecycle

``` text
Production Data
      ↓
Dataset
      ↓
Training / Fine-tuning
      ↓
Evaluation
      ↓
MLflow
      ↓
Model Registry
      ↓
Validation Gate
      ↓
Deployment
      ↓
Model API
      ↓
Model Gateway
      ↓
Agents
      ↓
Monitoring
      ↓
Evaluation
      ↓
Retraining
```

Applies to:

-   LLMs
-   embeddings
-   classification
-   vision
-   recommendation
-   graph ML
-   forecasting
-   generative models

External models follow a different lifecycle:

``` text
External Provider
      ↓
Model Gateway
      ↓
Agents
```

but still participate in health, latency, cost and evaluation
monitoring.

------------------------------------------------------------------------

# 41. Continuous Improvement Loop

``` text
Production
    ↓
Telemetry
    ↓
Evaluation
    ↓
Failure Detection
    ↓
Dataset Construction
    ↓
Training / Fine-tuning
    ↓
Evaluation
    ↓
Quality Gate
    │
    ├── FAIL → reject
    │
    └── PASS
          ↓
      Registry
          ↓
      Deployment
          ↓
      Monitoring
```

Automatic deployment MUST be controlled by explicit validation gates.

An improved evaluation score alone is not sufficient when safety,
latency, cost or regression constraints fail.

------------------------------------------------------------------------

# 42. Observability Specification

Every service MUST emit structured telemetry.

Minimum fields:

``` json
{
  "timestamp": "...",
  "traceId": "...",
  "requestId": "...",
  "correlationId": "...",
  "service": "...",
  "serviceVersion": "...",
  "userId": "...",
  "agentId": "...",
  "agentVersion": "...",
  "modelId": "...",
  "modelVersion": "...",
  "latencyMs": 0,
  "status": "success"
}
```

Sensitive fields MUST be redacted.

------------------------------------------------------------------------

# 43. Failure and Retry Standard

Every asynchronous operation should define:

``` text
retryable
maxAttempts
backoff
timeout
idempotencyKey
deadLetterTopic
compensation
```

## Retryable

-   network timeout
-   temporary database unavailability
-   temporary model-server overload
-   Kafka transient failure

## Usually Non-Retryable

-   invalid schema
-   unauthorized request
-   denied policy
-   malformed user input
-   unsupported capability

## Dead-Letter Flow

``` text
Kafka Topic
    ↓
Consumer
    ↓
Failure
    ↓
Retry
    ↓
Failure
    ↓
DLQ
    ↓
Inspection / Replay
```

------------------------------------------------------------------------

# 44. Security Architecture

``` text
Client
 ↓
Authentication
 ↓
Identity Context
 ↓
Authorization
 ↓
Agent Capability Check
 ↓
Tool Permission
 ↓
Consent / Policy
 ↓
Execution
 ↓
Audit
```

Security requirements:

-   authentication before agent execution;
-   authorization before data access;
-   explicit consent for consequential actions;
-   least-privilege service identities;
-   encrypted transport;
-   encrypted sensitive storage;
-   secret manager;
-   auditability;
-   user/tenant isolation;
-   PII-aware logging;
-   tool allowlists;
-   model/provider credential isolation.

------------------------------------------------------------------------

# 45. Repository Structure

``` text
river/
├── apps/
│   ├── api-gateway/
│   ├── identity-service/
│   ├── session-service/
│   ├── task-router/
│   ├── agent-runtime/
│   ├── data-processing/
│   ├── retrieval-service/
│   ├── model-gateway/
│   ├── action-service/
│   ├── policy-service/
│   ├── audit-service/
│   ├── evaluation-service/
│   └── notification-service/
│
├── agents/
│   ├── knowledge-agent/
│   ├── retrieval-agent/
│   ├── planning-agent/
│   ├── action-agent/
│   ├── recommendation-agent/
│   ├── social-graph-agent/
│   ├── content-agent/
│   ├── moderation-agent/
│   ├── search-agent/
│   ├── notification-agent/
│   ├── trust-safety-agent/
│   └── analytics-agent/
│
├── packages/
│   ├── agent-sdk/
│   ├── event-contracts/
│   ├── model-sdk/
│   ├── retrieval-sdk/
│   ├── tool-sdk/
│   ├── plugin-sdk/
│   ├── policy-sdk/
│   ├── state-sdk/
│   ├── security/
│   ├── observability/
│   └── common/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── kafka/
│   ├── postgres/
│   ├── neo4j/
│   ├── redis/
│   ├── monitoring/
│   └── terraform/
│
├── ml/
│   ├── datasets/
│   ├── training/
│   ├── evaluation/
│   ├── experiments/
│   ├── pipelines/
│   └── model-configs/
│
├── docs/
│   ├── architecture/
│   ├── agents/
│   ├── events/
│   ├── models/
│   ├── APIs/
│   ├── operations/
│   └── ADRs/
│
└── RIVER-MULTI-AGENT-IMPLEMENTATION.md
```

------------------------------------------------------------------------

# 46. Database Ownership Matrix

  Data                  Owner                        Store
  --------------------- ---------------------------- -------------------------
  Users                 Identity Service             PostgreSQL
  Permissions           Identity Service             PostgreSQL
  Sessions              Session Service              PostgreSQL/Redis
  Conversations         Session Service              PostgreSQL
  Workflow state        Agent Runtime                PostgreSQL/Redis
  Checkpoints           Agent Runtime                PostgreSQL
  Personal graph        Data Processing/Data Layer   Neo4j
  Embeddings            Data/Retrieval Layer         pgvector
  Retrieval telemetry   Retrieval Service            PostgreSQL
  Model registry        Model Gateway/MLOps          PostgreSQL/Registry
  Actions               Action Service               PostgreSQL
  Policies              Policy Service               PostgreSQL
  Audit                 Audit Service                PostgreSQL/append store
  Evaluations           Evaluation Service           PostgreSQL/MLflow
  Notifications         Notification Service         PostgreSQL

The ownership rule is:

> **A service owns its state; other services access it through an API,
> SDK or event contract, not by directly writing its tables.**

------------------------------------------------------------------------

# 47. Service Dependency Rules

## Allowed

``` text
API Gateway
 → Identity
 → Session
 → Task Router

Agent Runtime
 → Agent SDK
 → Retrieval SDK
 → Model SDK
 → Action API
 → Policy API

Agents
 → Agent SDK
 → Retrieval SDK
 → Model SDK
 → Tool SDK

Data Processing
 → Graph abstraction
 → Embedding abstraction
```

## Forbidden

``` text
Agent A → Agent B source code
Agent → another service's database
LLM → direct database credentials
Client → internal database
Model provider → direct agent dependency
Policy → Action implementation
```

------------------------------------------------------------------------

# 48. Testing Strategy

Testing is organized into five levels.

## Level 1 --- Unit

Every class/function:

-   input validation
-   deterministic behavior
-   error paths

## Level 2 --- Contract

Verify:

-   API schemas
-   Kafka schemas
-   agent contracts
-   model contracts
-   retrieval contracts

## Level 3 --- Integration

Verify:

``` text
Service → Database
Service → Kafka
Agent → Model Gateway
Agent → Retrieval Service
Action → Policy
```

## Level 4 --- Workflow

Verify complete graphs:

``` text
User
→ API
→ Identity
→ Session
→ Router
→ LangGraph
→ Retrieval
→ Model
→ Plan
→ Policy
→ Action
→ Audit
→ Response
```

## Level 5 --- Production/Load

Test:

-   concurrent users
-   Kafka throughput
-   model concurrency
-   streaming
-   P95/P99 latency
-   failure recovery
-   autoscaling
-   queue backpressure
-   database saturation
-   model fallback

------------------------------------------------------------------------

# 49. Initial Implementation Order

## Phase 1 --- Foundation

``` text
API Gateway
Identity
Session
PostgreSQL
Redis
Kafka
Observability
```

## Phase 2 --- Agent Platform

``` text
Agent SDK
Event Contracts
Agent Runtime
LangGraph
Checkpointing
Agent Registry
```

## Phase 3 --- Data Intelligence

``` text
Data Processing
Neo4j
pgvector
Embedding Pipeline
Retrieval Service
```

## Phase 4 --- Core Agents

``` text
Knowledge Agent
Retrieval Agent
Planning Agent
Action Agent
```

## Phase 5 --- Social Intelligence

``` text
Social Graph Agent
Recommendation Agent
Content Agent
Search Agent
Notification Agent
```

## Phase 6 --- Safety

``` text
Moderation Agent
Trust & Safety Agent
Policy Service
Audit Service
```

## Phase 7 --- Model Platform

``` text
Model Gateway
Model Registry
Streaming
Fallback
Model Health
Cost Tracking
```

## Phase 8 --- MLOps and Evaluation

``` text
Evaluation Service
Training Pipelines
MLflow
Quality Gates
Model Deployment
Continuous Evaluation
```

------------------------------------------------------------------------

# 50. Minimum Viable Multi-Agent Workflow

The first end-to-end implementation SHOULD prove the following path:

``` text
User
 ↓
API Gateway
 ↓
Identity + Session
 ↓
Task Router
 ↓
LangGraph Supervisor
 ↓
 ┌──────────────┬──────────────┐
 ▼              ▼              ▼
Knowledge    Retrieval      Planning
Agent        Agent          Agent
 │              │              │
 └──────────────┴──────────────┘
                ▼
          Evidence/Plan
                ▼
          Model Gateway
                ▼
           Action Agent
                ▼
          Policy Service
                ▼
          Action Service
                ▼
           Audit Service
                ▼
          State Checkpoint
                ▼
          Streaming Response
```

This is the architectural proof that River has moved from a conventional
API application to a stateful, event-driven multi-agent platform.

------------------------------------------------------------------------

# 51. Non-Negotiable Architectural Invariants

1.  **Identity precedes agent execution.**
2.  **User identity is context/state, not a dedicated agent process.**
3.  **LangGraph owns orchestration and workflow state.**
4.  **Kafka is the event backbone, not the agent itself.**
5.  **Agents are capability providers and remain loosely coupled.**
6.  **Specialized agents do not directly own another agent's
    implementation.**
7.  **Agents do not directly write another service's database.**
8.  **Retrieval is abstracted behind the Retrieval Service/SDK.**
9.  **Models are abstracted behind the Model Gateway.**
10. **LLMs propose reasoning/decisions; execution services enforce
    authorization and perform actions.**
11. **Consequential actions pass through policy/consent.**
12. **Actions are structured and traceable.**
13. **Workflow state is persisted externally.**
14. **Every long-running workflow is resumable.**
15. **Interactive AI supports streaming and cancellation.**
16. **Low-latency workloads use appropriate lightweight models rather
    than invoking a large reasoning model for every task.**
17. **High-volume social tasks such as ranking/moderation should use
    specialized models/services where appropriate rather than making
    every task an LLM call.**
18. **Every model version is observable and evaluable.**
19. **Every agent execution is observable.**
20. **Evaluation is part of the production architecture, not a
    post-development activity.**
21. **Failed asynchronous messages are recoverable through retry/DLQ
    mechanisms.**
22. **Security and consent are enforced outside the LLM.**
23. **Services scale independently.**
24. **Model/provider replacement must not require rewriting agents.**
25. **New agents should be addable by implementing the Agent SDK
    contract and registering capabilities, without modifying the core
    supervisor for ordinary capability additions.**

------------------------------------------------------------------------

# 52. Definition of Done for a New Agent

A new River agent is considered production-ready when it has:

``` text
[ ] Agent manifest
[ ] Agent SDK implementation
[ ] Input schema
[ ] Output schema
[ ] Capability registration
[ ] Authentication/authorization requirements
[ ] Kafka event contracts if asynchronous
[ ] No direct dependency on another agent implementation
[ ] No direct access to another service's database
[ ] Model capabilities requested through Model Gateway
[ ] Retrieval requested through Retrieval Service
[ ] Structured logging
[ ] OpenTelemetry tracing
[ ] Metrics
[ ] Unit tests
[ ] Contract tests
[ ] Integration tests
[ ] Failure handling
[ ] Retry policy
[ ] Timeout policy
[ ] Security review
[ ] Evaluation dataset
[ ] Quality metrics
[ ] Load test
[ ] Deployment manifest
[ ] Runbook
```

------------------------------------------------------------------------

# 53. Definition of Done for the Platform

River's first production-grade multi-agent platform is complete when it
demonstrates:

``` text
[ ] Multi-user identity and session management
[ ] Persistent workflow state
[ ] LangGraph orchestration
[ ] Concurrent multi-agent execution
[ ] Kafka event communication
[ ] Personal data processing
[ ] Neo4j graph storage
[ ] pgvector semantic retrieval
[ ] Hybrid retrieval
[ ] Model Gateway
[ ] Streaming inference
[ ] Model fallback
[ ] Structured planning
[ ] Action graphs
[ ] Policy/consent enforcement
[ ] Action execution
[ ] Audit/provenance
[ ] Continuous monitoring
[ ] Agent evaluation
[ ] Model evaluation
[ ] Data-quality monitoring
[ ] MLOps lifecycle
[ ] Kubernetes deployment
[ ] Autoscaling
[ ] Rate limiting
[ ] Backpressure
[ ] Dead-letter handling
[ ] Security controls
[ ] End-to-end tracing
[ ] Continuous evaluation
```

------------------------------------------------------------------------

# 54. Final Architecture Principle

River should not be implemented as:

``` text
One Large AI Agent
        ↓
Many Tools
        ↓
Large LLM
```

It should be implemented as:

``` text
                         RIVER AI PLATFORM
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
   DATA PLANE             INTELLIGENCE PLANE       PLATFORM PLANE
        │                       │                        │
      Kafka                 LangGraph              Model Gateway
      Neo4j                 Supervisor                  │
    PostgreSQL              Agents                    MLOps
     pgvector               Retrieval                Evaluation
   Embeddings               Planning                 Kubernetes
   Data Quality             Actions                  Observability
        │                       │                        │
        └───────────────────────┼────────────────────────┘
                                ▼
                         River Social Users
```

The architecture is therefore extensible at three independent levels:

``` text
NEW DATA SOURCE
      ↓
Data/Event Contracts

NEW AGENT
      ↓
Agent SDK + Capability Registration

NEW MODEL
      ↓
Model Gateway + Model Registry
```

Adding any one of these should not require redesigning the rest of the
platform.

------------------------------------------------------------------------

## Source Basis

Primary architecture source:

**River Personal Intelligence Architecture --- First-90-Day Technical
Design**

The source establishes the architectural objective, identity/session
boundary, LangGraph orchestration, supervisor/specialized-agent model,
Kafka event backbone, personal data processing, graph/vector hybrid
retrieval, structured action management, consent/authorization/audit,
unified Model Gateway, MLOps lifecycle, continuous monitoring,
infrastructure and three-plane architecture.

This implementation specification adds concrete service/module names,
directory structures, classes, interfaces, schemas, database ownership
conventions, API shapes, topic taxonomy, testing conventions and
operational rules where the source architecture leaves those
implementation details open.
