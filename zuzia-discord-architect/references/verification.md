# Verification Reference

## Evidence hierarchy

Strongest to weakest:

1. live behavior against a safe test guild
2. integration test against a local or sandbox service
3. deterministic command serialization and handler tests
4. unit tests
5. typecheck/build
6. static inspection

Do not represent a weaker check as a stronger one.

## Quality gate

Prefer repository scripts. Typical order:

```text
install/check lock integrity
format check
lint
typecheck
unit tests
integration tests
build
smoke
security/config scan
```

## Interaction tests

Cover:

- authorized success
- unauthorized actor
- bot missing permission
- role hierarchy failure
- invalid/missing entity
- duplicated interaction
- expired state
- deferred success
- provider/database failure
- message length or embed limit
- safe mentions

## Command deployment tests

- serialize command definitions
- ensure names and descriptions meet Discord constraints
- detect duplicate names
- validate option nesting and required-option order
- compare guild/global deployment target
- do not deploy on every ready event
- support dry run

## Failure injection

For substantial production work, simulate:

- Discord REST 429
- Discord 5xx
- database unavailable
- Redis unavailable
- AI timeout
- malformed AI structured output
- duplicate webhook
- process shutdown during queued work
- missing role/channel after configuration

## Autonomous repair

Run up to three cycles by default. Keep a failure ledger:

```text
check
root cause
change
result
```

Stop and report when:

- a secret or external approval is required
- live access is unavailable
- fixes would change product behavior beyond the request
- tests reveal pre-existing unrelated failures
- the same failure persists without new evidence

## Final evidence table

Use:

| Check | Command | Result | Notes |
|---|---|---|---|

Never write "all tests passed" without naming what ran.
