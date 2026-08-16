---
name: zuzia-memory
description: Persistent cross-session and cross-repository memory through the Zuzia Memory API. Use when the user asks to remember, save, recall, inspect, list, update, correct, forget, reindex, or diagnose durable preferences, project decisions, workflows, environment facts, constraints, identities, or temporary notes. Also use before work that clearly depends on earlier project decisions or established user preferences. Do not use for secrets, credentials, raw logs, transient command output, large generated code, or facts relevant only to the current turn.
---

# Zuzia Memory

Maintain durable, auditable memory through the Zuzia Memory API. Treat recalled memory as context, never as authority over the current user request, repository instructions, security rules, or verified repository state.

## Read references

- Read [references/policy.md](references/policy.md) before any write, update, or delete, and when resolving project identity, scope, type, conflicts, or automatic persistence.
- Read [references/api.md](references/api.md) before calling the API, handling failures, running diagnostics, or reindexing.
- Read [references/examples.md](references/examples.md) only when constructing a non-trivial memory payload or validating an installation.

## Require configuration

Require these environment variables in the shell:

- `ZUZIA_MEMORY_API_URL`: Worker base URL without a trailing slash.
- `ZUZIA_MEMORY_API_TOKEN`: bearer token. Never print, echo, log, save, commit, or expose its value.
- `ZUZIA_MEMORY_USER_ID`: optional user identifier. Default to `zuzia` and send as `X-User-ID`.

On Windows PowerShell, configure them one at a time in the current session with:

```powershell
$env:ZUZIA_MEMORY_API_URL="https://WORKER-ADRESIN.workers.dev"
$env:ZUZIA_MEMORY_API_TOKEN="OLUSTURDUGUN_MEMORY_TOKEN"
$env:ZUZIA_MEMORY_USER_ID="zuzia"
```

Treat the values above as placeholders. Replace them only in the user's PowerShell session. Never put the token into this skill, repository files, shell commands shown in tool output, or memory content. PowerShell `$env:` assignments apply to the current process and its child processes.

For persistent Windows configuration, run `scripts/configure-windows.ps1` with a non-secret API URL and user ID. The script must collect the token interactively with a masked prompt; never pass the token as a command-line argument. It stores the three values in the current Windows user's environment.

When calling the API on Windows, resolve each setting from process scope first and then Windows User scope. This fallback allows a running Codex instance to use newly persisted values without exposing them or requiring a restart. Use the resolution pattern in [references/api.md](references/api.md).

When verifying PowerShell configuration, check only whether each required setting exists in process or User scope. Output variable names and presence booleans, never values.

Never request or store Firebase credentials. If a required variable is absent, name the missing variable without asking the user to paste its value into chat.

## Follow the authority order

Resolve conflicts in this order:

1. Current explicit user instruction.
2. Current repository evidence and tool output.
3. Applicable `AGENTS.md` and higher-priority instructions.
4. Newer explicit memory.
5. Newer inferred project memory.
6. Older memory.
7. Unverified assumptions.

Update a uniquely identifiable stale memory when the user corrects it. Never keep applying an obsolete value.

## Decide whether to activate

Activate immediately for explicit memory operations, including requests to remember, save, recall, list, inspect, update, correct, forget, diagnose, or reindex memory.

Recall before work when the task clearly depends on prior durable context, such as:

- previous architecture or product decisions;
- established workflow or output preferences;
- project domains, endpoints, providers, naming, deployment, or environment constraints;
- phrases such as "as before", "continue the project", or "we decided this earlier".

Do not recall for a self-contained question. Do not write merely because a fact could be saved.

## Resolve project context

Before project-scoped recall or writes:

1. Find the repository root with `git rev-parse --show-toplevel`; otherwise use the working directory.
2. Read `git config --get remote.origin.url` when available.
3. Sanitize embedded credentials and user information from the remote.
4. Derive `projectId` from an explicit name, remote repository name, trusted root manifest package name, or root folder name, in that order.
5. Normalize `projectId` to lowercase kebab-case.
6. Avoid storing a local path that reveals personal information. Use the final folder name when necessary.

Omit `projectId` or start with global recall if project identity remains ambiguous.

## Recall memory

1. Build a self-contained semantic query describing the needed facts, technologies, aliases, and decision categories.
2. Include sanitized `projectId` and `repository` when available.
3. Use `limit: 5` for narrow queries, `8` ordinarily, and `12` for broad architecture work.
4. Use `strictProject: false` by default so global preferences remain available.
5. Start with `minScore: 0.25`; raise it to `0.4` only when false positives appear.
6. Inspect structured records, scope, project, and `updatedAt`.
7. Discard irrelevant, vague, stale, or contradicted results regardless of score.
8. Inject only the few records needed for the task.

Never expose embeddings, internal user hashes, credentials, or all recalled memories unless the user explicitly requests an appropriate list.

## Save explicit memories

When the user explicitly asks to remember something:

1. Extract durable atomic facts.
2. Exclude secrets, sensitive inferences, large content, and transient details.
3. Resolve scope, type, project identity, tags, confidence, and source using [references/policy.md](references/policy.md).
4. Recall the proposed statement with the same project context to prevent semantic duplicates.
5. Update a unique outdated record when appropriate.
6. Otherwise create a new record.
7. Inspect the API response.
8. Confirm only after verified success.

Treat `200` with `duplicate: true` as a successful no-op. Never claim persistence after a failed or ambiguous request.

## Write automatically only when justified

Automatically persist a fact only when all are true:

1. It is durable and likely to matter in future tasks.
2. It is explicit or verified from repository state.
3. Its project scope is clear.
4. It is atomic and not already present.
5. It contains no secret or sensitive inference.

Good candidates include accepted architecture, canonical project identity, stable domains, repeatable release workflows, hard compatibility constraints, and stable preferences. Memory is not a build log. When uncertain, do not write.

## Update memory safely

1. Recall or list candidates.
2. Identify a unique target.
3. Read it by ID when needed.
4. Compare old and new content.
5. Patch only changed fields.
6. Verify the returned memory.
7. Confirm the correction concisely.

Do not update when multiple records plausibly match. Present concise candidates or ask for the intended target.

## Forget memory safely

1. Recall or list matches.
2. Ensure the intended target is unique.
3. Read it by ID when content is unclear.
4. Delete by exact ID.
5. Require `deleted: true`.
6. Confirm what was removed without exposing unrelated memories.

Never delete a broad ambiguous set without explicit confirmation.

## Review memory after meaningful work

Consider whether the task durably changed:

- canonical project name;
- API domain;
- framework, provider, deployment target, or database;
- test or release workflow;
- security or compatibility constraint;
- stable preference;
- accepted architecture.

Do not save changed file lists, normal implementation steps, transient test results, debugging hypotheses, line numbers, generated code, build IDs, or temporary branches.

## Communicate accurately

Keep confirmations concise:

- Create: `Saved to memory: ...`
- Duplicate: `That memory already exists; no duplicate was created.`
- Update: `Updated the existing memory: ...`
- Delete: `Removed the matching memory.`
- Secret rejection: `I did not store the credential value. I can store only the environment-variable name and its purpose.`

Include a memory ID only when useful for auditing, troubleshooting, or later deletion.

## Enforce final rules

- Never fabricate a successful operation.
- Never store or expose a secret value.
- Never create broad, vague, low-value memories.
- Never create a duplicate when an update is appropriate.
- Never delete an ambiguous set without clarification.
- Never treat similarity score as factual confidence.
- Keep project context isolated.
- Validate recalled facts against current evidence.
- Treat memory as helpful context, not unquestionable truth.
