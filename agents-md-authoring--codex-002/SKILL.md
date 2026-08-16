---
name: agents-md-authoring
description: Create, review, split, and maintain AGENTS.md instruction files for coding agents. Use when a user asks to add project agent guidance, improve an existing AGENTS.md, define repository-wide coding rules, place scoped instructions in a monorepo, or diagnose conflicting inherited agent instructions.
---

# AGENTS.md Authoring

Create precise, minimal instructions that match the repository's real workflows.

## Workflow

1. Read every applicable `AGENTS.md` from the workspace root to the target file.
2. Inspect the relevant build scripts, package manifests, tests, formatting rules, and documentation before drafting instructions.
3. Preserve valid user-owned rules. Remove or rewrite only instructions that are stale, contradictory, unverifiable, or unsafe.
4. Put repository-wide rules in the root `AGENTS.md`.
5. Put package-, language-, or directory-specific rules in the nearest nested `AGENTS.md` that owns that subtree.
6. Avoid duplicating parent rules in child files. State only the narrower override or addition.
7. Use exact commands that exist in the repository. Never invent scripts, paths, tools, or CI checks.
8. Keep secrets, credentials, personal data, machine-specific absolute paths, and transient state out of instruction files.
9. Verify every referenced command, path, and package name with read-only checks.
10. Re-read the final inheritance chain and remove contradictions, ambiguity, and redundant prose.

## Content

Prefer short operational sections when relevant:

- repository purpose and architecture boundaries;
- build, test, typecheck, lint, and formatting commands;
- code style and public API constraints;
- testing expectations;
- security and secret-handling rules;
- documentation and release requirements;
- directory-specific overrides.

Do not add generic advice that the agent already knows. Do not copy README content unless it changes how work must be performed.

## Scope rules

Treat a root `AGENTS.md` as applying to the whole repository. Treat a nested file as applying to its directory subtree and overriding conflicting parent guidance for that subtree. Treat direct system, developer, and user instructions as higher priority than repository files.

Read [references/spec.md](references/spec.md) when deciding placement, precedence, compatibility, or nested-file behavior.

## Validation

- Confirm each instruction is actionable and testable.
- Confirm each command exists and uses the repository's package manager.
- Confirm nested files do not silently broaden permissions.
- Confirm no rule asks the agent to bypass security, approvals, tests, or user intent.
- Report any unresolved conflict instead of choosing a materially different policy without authority.
