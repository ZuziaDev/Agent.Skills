# Feature Catalog

## Commands

A command module should expose:

- command data/definition
- execution handler
- authorization requirements
- cooldown policy
- localization if used
- tests for parsing, permissions, and failure paths

Keep command deployment separate from gateway startup.

## Components and modals

Use versioned, namespaced identifiers:

```text
feature:action:entityId:version
```

Sign or server-validate state when identifiers carry sensitive context. Never trust an entity ID merely because it came from a button.

## Moderation case system

Minimum model:

- case ID
- guild ID
- target user ID
- actor user ID
- action type
- reason
- evidence references
- duration and expiration
- status
- timestamps
- correlation/source ID

Use transactions when the Discord action and database record must remain consistent. Record partial failure and support reconciliation.

## AutoMod

Prefer a pipeline:

```text
normalize
-> exemptions
-> deterministic rules
-> rate/spam signals
-> optional AI classifier
-> policy decision
-> action
-> audit
```

Cache short-lived spam signals. Persist only what is necessary.

## Tickets

Require:

- atomic ticket number or unique ticket identity
- one-open-ticket policy if configured
- channel or thread ownership validation
- staff authorization
- close confirmation
- transcript policy
- retention/deletion policy
- duplicate-click safety
- recovery if channel creation succeeds but persistence fails

Threads may be cheaper and easier than channels for some servers. Choose intentionally.

## Roles

For button/select roles:

- verify guild and configured message
- verify role allowlist
- verify hierarchy
- make add/remove idempotent
- handle missing roles
- audit configuration changes

## Welcome and leave

- handle DM failures without failing the whole join flow
- avoid relying on stale member count for correctness
- validate configured channels and roles
- do not request Presence intent
- use a queue if external image generation or card rendering is slow

## Scheduled notifications

- store schedule and timezone explicitly
- use a durable scheduler for production
- prevent duplicate delivery
- record last successful run
- handle daylight-saving changes
- make message templates safe for mentions

## GitHub, Twitch, YouTube, and external notifications

- verify webhook signatures or polling credentials
- deduplicate by provider event ID
- transform provider data into an internal event
- format Discord output at the final adapter
- retry with backoff
- expose dead-letter or failed-delivery visibility

## Economy and leveling

Only add when requested. Require:

- anti-farming controls
- transaction ledger
- idempotency
- integer-safe currency
- cooldowns
- admin audit
- no pay-to-win defaults
- migration strategy for balance changes

## Voice

Use the official voice package compatible with the selected Discord library. Handle:

- connection lifecycle
- reconnects
- resource cleanup
- empty-channel behavior
- permissions
- media licensing and source policies

## Dashboard

Keep the dashboard separate from Discord event handlers. Use a shared service layer and repository layer, not direct cache mutation from HTTP routes.
