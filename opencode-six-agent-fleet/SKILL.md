---
name: opencode-six-agent-fleet
description: Install and orchestrate two coordinated OpenCode fleets with twelve specialized subagents, including a six-agent Claude-only review fleet. Use when setting up or repairing OpenCode multi-agent workflows, delegating repository analysis, running parallel evidence collection, reviewing code, performance, API contracts, dependencies, documentation, releases, or enforcing gated TypeScript and Node.js delivery.
---

# OpenCode Dual Six-Agent Fleet

Operate two separate six-agent fleets with least-privilege permissions and one integration owner.

## Install or repair

Run the manager from this skill directory:

```text
node scripts/manage-fleet.mts install
node scripts/manage-fleet.mts validate
```

The installer copies all twelve agent definitions to `~/.config/opencode/agents`, installs this skill into `~/.config/opencode/skills`, and creates a concise global `AGENTS.md` only when one does not already exist.

Never overwrite an existing global `AGENTS.md`. Report the preserved file.

## Use the fleet

Read [references/lane-contract.md](references/lane-contract.md) before delegation.

1. Inspect repository state and discover build, typecheck, lint, and test commands.
2. Select only roles that materially help the request. Keep the core fleet and Claude review fleet logically separate.
3. Give every role a bounded lane brief with goal, owned paths, forbidden paths, evidence requirements, and acceptance checks.
4. Run independent read-only lanes in parallel.
5. Give writes only to `implementer`, unless the current user explicitly authorizes another isolated writer.
6. Integrate in one place. Preserve user changes and resolve overlaps deliberately.
7. Run project-native lint, typecheck, build, tests, and affected examples.
8. Report completed work, checks, failures, and residual risks concisely.

## Core fleet

- `bug-investigator`: reproduce failures and isolate root causes.
- `test-engineer`: assess coverage and define regression tests.
- `log-analyst`: correlate runtime, build, test, and CI evidence.
- `security-auditor`: inspect trust boundaries, input validation, dependencies, and secret handling.
- `architecture-reviewer`: protect public APIs, ESM boundaries, dependency direction, and migration readiness.
- `implementer`: make the approved code and test changes, then run local gates.

## Claude review fleet

- `claude-code-reviewer`: review correctness, maintainability, and edge cases.
- `claude-performance-profiler`: identify algorithmic, allocation, I/O, and concurrency risks.
- `claude-api-contract-guardian`: protect public exports, runtime contracts, and compatibility.
- `claude-dependency-auditor`: inspect dependency necessity, supply-chain risk, and package hygiene.
- `claude-docs-reviewer`: verify README, examples, and API documentation against implementation.
- `claude-release-gatekeeper`: audit release readiness, package entrypoints, artifacts, and required gates.

All Claude review agents use `antigravity-manager/claude-*` models and remain read-only. The core `implementer` remains the only write owner.

## Hard rules

- Do not claim parallel work unless separate agents actually ran.
- Keep analysis roles read-only.
- Do not permit subagents to spawn more subagents.
- Do not allow external-directory access.
- Do not run install, publish, deploy, destructive Git, or destructive filesystem commands automatically.
- Do not expose secret values in prompts, logs, reports, or memory.
- Do not accept a lane conclusion without file, command, or runtime evidence.
- Do not claim completion when required checks fail.
- Treat missing scripts as missing validation, not a passing result.

## Validation

Run `node scripts/manage-fleet.mts validate` after installation or modification. Validate the skill itself with the bundled `skill-creator` validator when available.
