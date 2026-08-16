# AGENTS.md compatibility reference

Source basis: [agentsmd/agents.md](https://github.com/agentsmd/agents.md), audited at commit `d1ac7f0`, MIT licensed.

## Core behavior

- Store agent instructions in plain Markdown named `AGENTS.md`.
- Place a root file at the repository root for broad instructions.
- Place additional files in subdirectories when a subtree needs narrower guidance.
- Resolve instructions from broad to specific; the nearest applicable file takes precedence when rules conflict.
- Keep human project documentation in README files and agent-operational guidance in `AGENTS.md`.

## Compatibility

Codex and OpenCode discover `AGENTS.md` natively. Claude Code primarily uses `CLAUDE.md`; when Claude must share the same policy, keep one canonical policy and import or carefully mirror it without creating two divergent sources of truth.

## Design principles

- Make rules concrete and repository-specific.
- Prefer verified commands and paths.
- Split by scope instead of growing one giant root file.
- Avoid repeating inherited rules.
- Preserve user-owned constraints and established architecture.
