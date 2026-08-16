# Security Reference

## Permission compiler

Derive permissions from features. Do not start from Administrator.

Examples:

- Slash commands only: `applications.commands` plus bot scope as needed.
- Welcome role: Manage Roles, with the bot role above the assigned role.
- Timeout: Moderate Members.
- Ban: Ban Members.
- Ticket channels: Manage Channels and appropriate channel permissions.
- Message cleanup: Manage Messages and required channel visibility.
- Webhook creation: Manage Webhooks only if the bot truly creates them.

Always perform runtime authorization checks for sensitive actions even when command defaults are configured.

## Privileged intents

Enable only with a feature-level reason:

- Guild Members: member lifecycle, joins, member cache, role workflows.
- Message Content: message-based moderation, prefix commands, or message analysis that cannot use interactions.
- Presence: presence-driven features.

Document why each privileged intent exists. Remove it when the feature is removed.

## Role hierarchy

Before moderation or role mutation, verify:

- actor permission
- actor role hierarchy
- bot permission
- bot role hierarchy
- target is not the guild owner
- target is not the bot itself
- target is not equal or higher than the bot where Discord forbids the action

## Output safety

- Use `allowedMentions` to prevent mass mention abuse.
- Escape or isolate user-controlled Markdown where appropriate.
- Limit embed field counts and lengths.
- Split long responses safely.
- Validate URLs and reject unsupported schemes.
- Do not fetch user URLs from private networks or metadata endpoints.
- Validate attachment type and size before processing.

## Secrets

- Keep tokens in environment or approved secret stores.
- Never write real secrets to `.env.example`.
- Redact `Authorization`, tokens, cookies, webhook URLs, database URLs, and AI keys.
- Detect accidentally committed secrets and stop before pushing.
- Rotate a token if it appears in logs or chat. Deleting the text is not enough.

## Web dashboards

Require:

- proven identity
- guild membership and permission re-checks
- state/CSRF protection
- secure cookie settings
- session expiration
- server-side authorization
- tenant scoping
- audit logging for configuration and moderation actions
- rate limiting
- safe redirect validation

Never trust permissions embedded only in the client session forever. Re-check sensitive operations.

## Webhooks

- Verify signatures where the provider supports them.
- Store an idempotency key.
- Enforce body size limits.
- Validate content type.
- Reject stale timestamps where applicable.
- Do not trust user IDs or guild IDs sent by an unsigned client.
- Return quickly, then enqueue slow work.

## Moderation

Use layered controls:

1. deterministic allow/deny and rate rules
2. context-aware heuristics
3. optional AI classification
4. human review for ambiguous severe actions
5. appeal and audit trail where appropriate

Avoid fully autonomous permanent bans based only on a single model response.

## Data protection

Classify stored data:

- configuration
- operational metadata
- moderation evidence
- transcripts
- message content
- AI memory
- billing or entitlement state

For sensitive content, define purpose, retention, access, deletion, and export behavior.

## Dangerous functionality

Do not add:

- unrestricted eval
- arbitrary shell commands
- arbitrary SQL
- arbitrary filesystem reads
- token or environment dumping
- remote code loading
- unauthenticated admin endpoints
- hidden owner backdoors
- mass-DM or unsolicited spam systems

A narrowly scoped owner maintenance command must still validate identity, guild context, input, and audit the action.
