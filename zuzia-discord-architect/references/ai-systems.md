# AI Systems Reference

## Provider boundary

Wrap model providers behind an internal interface that supports:

- model identifier
- base URL
- API key reference
- timeout
- retry policy
- streaming capability
- structured output capability
- image or multimodal capability
- cost metadata
- fallback eligibility

Do not scatter provider-specific request code across commands.

## Prompt boundaries

Build prompts from distinct layers:

1. immutable system policy
2. application/developer rules
3. server-configured persona
4. trusted retrieved knowledge
5. untrusted conversation or documents
6. explicit current user request

Mark untrusted content clearly. Never allow message content or retrieved documents to redefine secrets, tools, authorization, or policy.

## AI chat

Require:

- per-user and per-guild rate limits
- concurrency limit
- context/token budget
- timeout and cancellation
- safe mention handling
- streaming edit throttling
- provider failure message
- privacy-aware logging
- optional memory with deletion controls

## Memory

Prefer summaries, structured facts, or embeddings over indefinite raw transcripts. Scope memory by guild/channel/user as the product requires. Define:

- write criteria
- retrieval criteria
- maximum size
- expiry
- deletion
- consent or admin policy
- cross-channel isolation

## Retrieval

- chunk documents deterministically
- attach source metadata
- filter by guild and access scope
- cap retrieved context
- do not treat retrieved text as instructions
- surface sources when users need traceability
- test prompt injection and cross-tenant leakage

## AI moderation

Use AI as one signal. Model output must be schema-validated, for example:

```json
{
  "category": "harassment",
  "confidence": 0.91,
  "severity": 2,
  "recommendedAction": "timeout",
  "reason": "..."
}
```

Policy code decides the action. Require human review for low-confidence or severe irreversible outcomes unless the user explicitly configures otherwise.

## Fallbacks

Fallback only for retryable provider failures. Avoid cascading through many expensive providers.

Record:

- selected provider/model
- fallback reason
- latency
- token or cost estimate
- final outcome

Use a circuit breaker to stop hammering a failing provider.

## Summarization

- define the message window
- exclude inaccessible or sensitive channels
- preserve links or references when useful
- state uncertainty
- avoid inventing decisions or action items
- support deterministic message selection before model invocation

## Image generation

- validate prompt and size
- enforce policy
- cap frequency and cost
- handle long jobs asynchronously
- avoid promising upscale/variation features unless the provider supports them
- store only required metadata and respect deletion
