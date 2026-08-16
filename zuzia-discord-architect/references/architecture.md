# Architecture Reference

## Goal

Select an architecture proportional to the bot's actual complexity while leaving a clean path to scale.

## Discovery order

Inspect in this order:

1. Repository instructions.
2. `package.json` and lockfiles.
3. TypeScript or JavaScript configuration.
4. application entry points.
5. command, event, component, and modal loaders.
6. persistence and migrations.
7. deployment and process manager configuration.
8. tests and CI.
9. environment examples.
10. recent errors, logs, or issue context supplied by the user.

## Architecture levels

### Level 0: single-purpose utility

Use for a few commands with no durable state.

- one process
- one Discord client
- command modules
- minimal configuration
- no database unless the feature requires it

### Level 1: modular community bot

Use for moderation, tickets, roles, welcome, logging, and basic AI.

- command/event/component registries
- service layer for business logic
- repositories for persistence
- config schema
- structured logging
- tests around policy and state transitions

### Level 2: production multi-guild application

Use for many guilds, dashboards, paid plans, queues, or multiple instances.

- PostgreSQL
- Redis/shared cache
- queue workers
- API/dashboard boundary
- distributed cooldowns and locks
- telemetry
- migrations
- explicit tenant/guild scoping

### Level 3: large distributed bot

Use only when scale evidence exists.

- shard manager or externally orchestrated shards
- stateless gateway workers where practical
- shared command metadata
- distributed event processing
- partition-aware caching
- durable queues
- backpressure
- canary and rollback strategy

## Default module boundaries

Prefer feature-oriented boundaries:

```text
src/
  app/
    bootstrap/
    config/
    logging/
  discord/
    client/
    commands/
    components/
    events/
    deploy/
  features/
    moderation/
    tickets/
    roles/
    ai/
  infrastructure/
    database/
    cache/
    queue/
    providers/
  shared/
    errors/
    validation/
    types/
  tests/
```

Do not impose this structure on an existing repository unless it solves a real problem.

## Capability graph rules

For each feature, derive:

```text
Feature
  -> Discord surface
  -> Authorization
  -> Intents/scopes/permissions
  -> State
  -> External calls
  -> Failure modes
  -> Tests
  -> Operations
```

This graph controls implementation order and prevents accidental over-permissioning.

## Interaction lifecycle

Treat each interaction as a state machine:

```text
received
  -> validated
  -> authorized
  -> acknowledged
  -> executed
  -> persisted
  -> responded
  -> observed
```

Record terminal failure states. Ensure retries do not duplicate side effects.

## Multi-tenancy

Every guild-owned record should carry an explicit guild identifier. Queries must scope by guild unless intentionally global. Never trust a channel, role, case, ticket, or configuration identifier without verifying that it belongs to the active guild.

## Configuration

Use a schema validator. Separate:

- required secrets
- deployment identifiers
- optional feature flags
- per-guild settings
- runtime tuning
- observability configuration

Fail startup with a redacted, actionable message when required configuration is invalid.

## Decision record

For substantial changes, record only decisions with long-term consequences:

- database choice
- queue introduction
- shard strategy
- AI provider abstraction
- command registration strategy
- retention policy
- dashboard authentication model
