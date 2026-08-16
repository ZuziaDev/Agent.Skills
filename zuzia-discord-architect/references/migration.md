# Migration Reference

## Migration principles

1. Preserve behavior before improving architecture.
2. Build an inventory of commands, events, permissions, data, and deployment.
3. Identify breaking changes from official documentation.
4. Add compatibility adapters only when temporary.
5. Migrate in testable slices.
6. Remove obsolete paths after verification.
7. Provide rollback steps.

## Common migrations

### Prefix commands to application commands

- inventory aliases and argument parsing
- map arguments to typed options
- preserve permission and cooldown behavior
- replace message-only flows with modals or components
- migrate help output
- test guild registration before global deployment
- remove Message Content intent if no longer needed

### CommonJS to ESM

- confirm runtime and dependency support
- convert imports/exports
- replace `__dirname` patterns
- update test runner and build scripts
- verify dynamic module loading
- preserve file extension rules

### JavaScript to TypeScript

- introduce strict configuration gradually
- type external boundaries first
- avoid broad `any`
- validate runtime inputs because TypeScript is not runtime validation
- keep build and execution paths clear

### Database migration

- create schema migration
- backfill safely
- dual-read or dual-write only when necessary
- verify counts and invariants
- define rollback
- remove old storage after an explicit cutover

### Discord library major upgrade

- resolve the current official migration guide
- inventory renamed events, flags, builders, response APIs, intents, and cache behavior
- update types and tests
- serialize command definitions and compare
- run a dry registration
- test interaction reply and component flows

## Compatibility report

Record:

- current versions
- target versions
- breaking changes used by this repository
- files affected
- data migration
- deployment sequence
- rollback
- removed compatibility code
