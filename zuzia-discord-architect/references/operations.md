# Operations Reference

## Runtime

Use a supported Node.js release compatible with the selected Discord library. Pin or constrain versions intentionally. Validate configuration before login.

## Health

A gateway-connected bot needs more than a process-is-alive check.

Track:

- process alive
- config valid
- database reachable
- cache/queue reachable when mandatory
- Discord client state
- shard readiness
- queue backlog
- last successful heartbeat or interaction

Do not mark ready before required dependencies and command/event loading succeed.

## Graceful shutdown

On SIGTERM/SIGINT:

1. stop accepting HTTP or queue work
2. pause schedulers
3. drain or requeue in-flight jobs
4. destroy Discord client
5. close database/cache connections
6. flush telemetry
7. exit with a bounded timeout

## Logging

Use structured logs with:

- timestamp
- level
- service
- environment
- shard
- guild when appropriate
- interaction or request correlation ID
- command/event
- duration
- outcome
- redacted error details

Do not log full private messages by default.

## Metrics

Useful metrics:

- interaction count and latency
- error count by command/event
- Discord REST rate limits
- reconnects and shard state
- queue depth and age
- DB latency
- cache hit rate
- AI request latency/tokens/cost/fallbacks
- moderation action count and reversals
- ticket open/close age

## Sharding

Introduce sharding when Discord requires it or measurements justify it.

Ensure:

- shard-aware logging
- no process-local authoritative state
- shared cooldowns where cross-shard correctness matters
- cross-shard queries are bounded
- deployment can restart shards safely
- commands are registered once per application/environment
- scheduled jobs have leader election or durable queue ownership

## Queues

Use for:

- AI work
- image generation
- transcript generation
- external notifications
- scheduled jobs
- retries
- heavy moderation analysis

Jobs need idempotency keys, retry classification, maximum attempts, dead-letter visibility, and cancellation where meaningful.

## Deployment

A production plan should include:

- build artifact
- migrations
- environment validation
- command registration step
- rollout
- health gate
- rollback
- post-deploy verification

Avoid mutating global commands during every process start.

## Backups

Back up durable state. Test restore. A backup that has never been restored is an optimistic file collection, not a recovery plan.
