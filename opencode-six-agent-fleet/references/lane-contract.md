# Lane Contract

## Required brief

Every delegated lane must include:

- Goal.
- Exact files or directories to inspect.
- Files and directories it must not touch.
- Whether the lane is read-only or write-enabled.
- Relevant sibling ownership.
- Commands it may run.
- Evidence it must return.
- Acceptance checks.
- Required completion or failure report.

## Required report

Every lane must return:

- Status: `complete`, `partial`, or `blocked`.
- Findings ordered by severity.
- Files inspected.
- Commands run and exit codes.
- Recommended changes.
- Risks and uncertainty.
- Whether a write lane is required.

Never include credentials, tokens, private keys, raw environment dumps, or unredacted sensitive logs.

## Scheduling

Run these lanes in parallel when relevant:

- `bug-investigator` with `log-analyst`.
- `test-engineer` with `architecture-reviewer`.
- `security-auditor` with any read-only lane.
- `claude-code-reviewer` with `claude-api-contract-guardian`.
- `claude-performance-profiler` with `claude-dependency-auditor`.
- `claude-docs-reviewer` with `claude-release-gatekeeper`.

Run `implementer` only after required evidence is available. Serialize writes to shared exports, package manifests, lockfiles, TypeScript configs, CI configs, and documentation entrypoints.

Keep the Claude review fleet read-only. Use it as an independent second-pass review surface, not as a duplicate implementation team.

## Integration gates

Prefer repository scripts. Run applicable checks in this order:

1. Format check.
2. Lint.
3. Typecheck.
4. Build.
5. Unit tests.
6. Integration tests.
7. Affected examples.

Record skipped checks and the reason. Never fabricate a pass.
