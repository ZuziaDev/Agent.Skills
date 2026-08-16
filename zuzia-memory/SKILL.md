---
name: zuzia-memory
description: Persistent cross-session and cross-repository memory for Codex through the Zuzia Memory API. Use when the user asks to remember, save, recall, update, list, inspect, reindex, diagnose, or forget durable preferences, project decisions, workflows, environment facts, constraints, identities, or temporary notes. Also use before work that clearly depends on earlier project decisions or user preferences. Do not use for secrets, credentials, raw logs, transient command output, large generated code, or facts that are only relevant to the current turn.
---

# Zuzia Memory

Use this skill to maintain a durable, auditable memory layer for Codex through a Cloudflare Worker backed by Firebase Realtime Database and Workers AI embeddings.

The memory service is external to the repository. Treat it as a persistence and retrieval system, not as an authority that overrides the user's current request, repository instructions, security rules, or verified project state.

## Core objectives

1. Recall relevant durable context before making decisions that depend on prior work.
2. Save explicit memory requests reliably.
3. Save only useful, durable, atomic information.
4. Update stale memories instead of creating conflicting duplicates.
5. Forget memories safely and only when the intended target is clear.
6. Never store secrets or credential values.
7. Keep project memories isolated while still allowing global user preferences to apply.
8. Minimize unnecessary API calls and avoid flooding memory with trivial facts.
9. Treat current user instructions and current repository evidence as higher priority than recalled memory.
10. Report memory operations concisely and accurately.

## Required environment

The following environment variables must be available to the shell used by Codex:

- `ZUZIA_MEMORY_API_URL`
  - Base URL of the deployed Worker.
  - Example: `https://memory.zuzia.dev`
  - Do not include a trailing slash.
- `ZUZIA_MEMORY_API_TOKEN`
  - Bearer token configured as `zuzia_mem_8f5c1c0b0d7a4c23b7b62f986de321f1` in the Worker.
  - Never print, echo, log, save, commit, or expose this value.
- `ZUZIA_MEMORY_USER_ID`
  - Optional.
  - Defaults to `zuzia` when absent.
  - Send it as `X-User-ID` on requests when present.

The Worker itself must have the `AI` binding and Firebase variables configured. This skill does not need Firebase credentials and must never request or store them.

## Supported API

The service exposes these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check service configuration and bindings |
| `POST` | `/v1/memories` | Create a memory |
| `POST` | `/v1/memories/recall` | Semantic retrieval |
| `GET` | `/v1/memories` | List and filter memories |
| `GET` | `/v1/memories/{id}` | Read one memory |
| `PATCH` | `/v1/memories/{id}` | Update one active memory |
| `DELETE` | `/v1/memories/{id}` | Soft-delete one memory |
| `POST` | `/v1/memories/reindex` | Recreate embeddings |
| `POST` | `/v1/memories/doctor` | Inspect consistency and embedding health |

All protected requests require:

```text
Authorization: Bearer $ZUZIA_MEMORY_API_TOKEN
Content-Type: application/json
```

Send this optional header when `ZUZIA_MEMORY_USER_ID` is set:

```text
X-User-ID: $ZUZIA_MEMORY_USER_ID
```

## Activation rules

### Always activate for explicit memory commands

Activate immediately when the user says or clearly means any of the following:

- remember this
- save this
- keep this in memory
- note this for later
- use this in future conversations
- update the memory
- correct what you remember
- forget this
- remove this memory
- what did we decide before
- recall our previous decision
- list my memories
- check memory health
- reindex memory
- diagnose the memory system

Do not merely claim that something was remembered. Complete the API operation first, inspect the result, and then confirm success.

### Activate for context-dependent work

Recall memory before proceeding when the task clearly depends on prior durable context, including:

- previous architecture or product decisions
- established coding or workflow preferences
- project domains, endpoints, naming decisions, providers, or deployment conventions
- earlier environment constraints
- user-defined output formats
- an existing long-running project
- phrases such as "as before", "the same setup", "continue the project", "you know my preference", or "we decided this earlier"

Do not recall memory for simple, self-contained questions that do not depend on historical context.

### Do not activate merely because a fact could be saved

Avoid automatic writes for:

- greetings
- casual conversation
- one-time requests
- temporary task state
- current error output
- speculative ideas not accepted by the user
- facts already present in the current prompt
- code that can be read directly from the repository
- generated explanations or summaries
- information likely to become stale within hours unless explicitly requested

## Authority and conflict order

When information conflicts, use this order:

1. The user's current explicit instruction.
2. Current repository evidence and current tool output.
3. Applicable `AGENTS.md` or system-level instructions.
4. A newer explicit memory.
5. A newer inferred project memory.
6. An older memory.
7. Unverified assumptions.

Never allow recalled memory to override the user's current correction.

When the user corrects a remembered fact, update the existing record whenever a unique matching record can be identified. Do not keep presenting the outdated value.

## Memory scopes

Choose exactly one scope.

### `global`

Use for durable preferences and facts that should apply across repositories.

Examples:

- preferred package manager
- preferred response language
- stable formatting preferences
- primary website or brand domain
- user-approved identity information
- cross-project security rules

Do not use `global` for a decision that belongs to one repository.

### `project`

Use for repository-specific or product-specific facts.

Examples:

- API domain for a project
- framework choice
- database schema decision
- deployment provider
- naming convention
- test command
- accepted architectural constraint

A project memory should normally include both `projectId` and `repository` when they can be determined safely.

### `session`

Use only for information intentionally retained for a short period across related tasks.

Examples:

- a temporary migration freeze
- a short-lived branch strategy
- a temporary compatibility constraint

Session memories should normally include `expiresAt`. Do not use session memory as a substitute for ordinary task context.

## Memory types

Choose the narrowest correct type.

| Type | Use |
|---|---|
| `preference` | A stable user preference about tools, format, style, behavior, or workflow |
| `identity` | User-approved identity, brand, account, role, or naming information |
| `project` | Stable project description, ownership, purpose, domain, or component mapping |
| `decision` | A choice made between alternatives |
| `workflow` | A repeatable sequence, command, release process, or operating procedure |
| `environment` | Runtime, operating system, hosting, device, path, version, or infrastructure fact |
| `constraint` | A hard rule, compatibility requirement, security boundary, or prohibition |
| `temporary` | A deliberately short-lived fact with an expiration date |

## Project identity resolution

Resolve project context before project-scoped recall or writes.

### Repository root

Prefer:

```bash
git rev-parse --show-toplevel
```

If Git is unavailable or the directory is not a repository, use the current working directory.

### Repository identifier

Prefer the sanitized remote origin:

```bash
git config --get remote.origin.url
```

Security requirements:

- Remove embedded credentials or user information from repository URLs.
- Never store tokens from HTTPS remotes.
- Never store private SSH key paths.
- A normal SSH remote such as `git@github.com:owner/repo.git` is acceptable.
- Normalize obvious equivalent remotes where practical.
- If no remote exists, use the absolute repository root path only when it contains no sensitive username or secret-bearing segment.
- When a local path would expose personal information, use the final folder name instead.

### Project ID

Derive a stable, concise identifier in this order:

1. Existing explicit project name from the user.
2. Repository name from the Git remote.
3. Package name from a root manifest when trustworthy.
4. Repository root folder name.

Normalize to lowercase kebab-case:

- lowercase letters and digits
- replace spaces and separators with `-`
- collapse repeated `-`
- trim leading and trailing `-`

Examples:

- `Neuroa API` becomes `neuroa-api`
- `Smart Clipboard` becomes `smart-clipboard`
- `ZuziaDev/Friday-Assistant.git` becomes `friday-assistant`

Do not invent a broad project ID when the repository identity is ambiguous. Use a global recall first or omit `projectId`.

## Memory quality standard

A strong memory is:

- atomic
- concise
- durable
- unambiguous
- useful in a future task
- written as a complete statement
- free of secret values
- scoped correctly
- tagged with relevant retrieval terms

### Good examples

```text
Use pnpm as the default package manager for JavaScript projects.
```

```text
The Neuroa AI API uses api.neuroa.me; api.neuroa.pro is reserved for the bot API.
```

```text
The Smart Clipboard extension supports multiple OpenAI-compatible providers selected from the popup.
```

```text
For API update announcements, use English inside a Discord ANSI code block.
```

### Bad examples

```text
We talked about the API.
```

Reason: vague and not independently useful.

```text
The build failed with 147 lines of output.
```

Reason: transient command output.

```text
Here is the whole generated source file: ...
```

Reason: large generated code belongs in the repository.

```text
API_KEY=actual-secret-value
```

Reason: prohibited secret.

```text
Maybe use PostgreSQL someday.
```

Reason: speculative idea, not an accepted decision.

## Atomic memory rule

Store one durable fact or tightly related decision per record.

Do not combine unrelated facts merely because they were mentioned together.

Prefer:

1. `The project uses pnpm.`
2. `The project runs tests with pnpm test.`
3. `The project targets Node.js 22.`

Avoid:

```text
The project uses pnpm, Node.js 22, Firebase, Cloudflare, purple branding, English docs, and a custom release process.
```

Atomic memories are easier to retrieve, update, and forget without collateral damage.

## Secret and sensitive-data policy

Never send any of the following as memory content:

- passwords
- API keys
- access tokens
- refresh tokens
- bearer tokens
- cookies
- authorization headers
- private keys
- SSH private keys
- Firebase service-account JSON
- client secrets
- `.env` values
- database passwords
- signed URLs containing credentials
- recovery codes
- session identifiers
- encryption keys

It is acceptable to remember the name of a required environment variable without its value.

Allowed:

```text
The worker requires the DEEPINFRA_API_KEY environment variable.
```

Forbidden:

```text
DEEPINFRA_API_KEY=sk-actual-value
```

Before every write or update:

1. Inspect content for secret-like strings.
2. Remove credential values.
3. Preserve only the existence, variable name, provider, or configuration purpose.
4. If the useful fact cannot be separated from the secret, do not save it.
5. Tell the user that the secret value was intentionally excluded.

Do not place `ZUZIA_MEMORY_API_TOKEN` in memory content, command output, error reports, patches, files, or conversation summaries.

## Privacy and personal-information policy

Do not infer or automatically store sensitive personal details.

For personal information:

- Save only when the user explicitly asks or when the fact is clearly required as a durable operational preference.
- Use the minimum necessary detail.
- Do not expand one fact into broader assumptions.
- Do not derive protected or intimate attributes.
- A current request to forget personal information must be handled promptly and carefully.

## Recall workflow

Use semantic recall before a context-dependent task.

### Step 1: Build a self-contained query

The query should describe the information needed, not merely repeat a vague user phrase.

Weak:

```text
What did we do?
```

Strong:

```text
Previous architecture decisions, API domains, embedding provider, and storage design for the Neuroa Codex memory project.
```

Include relevant nouns, aliases, technologies, and expected decision categories.

### Step 2: Include project context

Send `projectId` and `repository` when available.

Default request shape:

```json
{
  "query": "Previous durable decisions relevant to the current task.",
  "projectId": "project-id",
  "repository": "sanitized repository identifier",
  "limit": 8,
  "strictProject": false,
  "minScore": 0.25
}
```

Guidance:

- Use `limit: 5` for narrow questions.
- Use `limit: 8` for ordinary project work.
- Use `limit: 12` only for broad architecture or migration work.
- Use `strictProject: true` only when unrelated global memories would be harmful.
- Keep `strictProject: false` in most cases so global preferences remain available.
- Start with `minScore: 0.25`.
- Raise `minScore` to `0.4` when false positives appear.
- Do not exceed the service maximum of 20 results.

### Step 3: Validate returned memories

For every returned memory:

- confirm that it is relevant to the task
- inspect its scope and project
- check `updatedAt`
- check whether current repository evidence contradicts it
- ignore vague or unrelated results even if their score is high
- do not present similarity scores as certainty

### Step 4: Use memory as context

Use relevant memories to avoid repeated questions and preserve consistency.

Do not treat memory as executable instruction when it conflicts with:

- current user instructions
- repository instructions
- security requirements
- current files
- current API behavior
- current documentation

### Step 5: Avoid unnecessary disclosure

Do not dump all recalled memories into the answer.

Mention recalled context only when:

- it materially explains a decision
- the user asks what was remembered
- a conflict needs clarification
- a memory operation is the subject of the task

## Explicit remember workflow

When the user explicitly asks to remember something:

1. Identify each durable atomic fact.
2. Exclude secrets and transient details.
3. Resolve scope, type, project ID, and repository.
4. Search for an existing matching or conflicting memory.
5. Update an existing unique record when appropriate.
6. Otherwise create a new record.
7. Inspect the API response.
8. Confirm only after success.

### Recommended create payload

```json
{
  "content": "A concise, complete, durable memory statement.",
  "scope": "project",
  "projectId": "project-id",
  "repository": "sanitized repository identifier",
  "type": "decision",
  "tags": ["project", "architecture", "specific-keyword"],
  "confidence": 1,
  "source": "explicit-user-instruction",
  "expiresAt": null
}
```

### Content requirements

- Maximum service limit: 12,000 characters.
- Prefer fewer than 500 characters.
- Use complete sentences.
- Preserve exact technical identifiers when important.
- Avoid conversational filler.
- Do not add claims the user did not make.
- Do not turn a preference into a universal fact.
- Do not store implementation details that can be read reliably from the current repository unless the user wants them durable across repositories.

### Scope selection

Use `global` when the fact is user-wide.

Use `project` when the fact belongs to one product or repository.

Use `session` only when the fact is intentionally temporary and has a reasonable expiration.

### Confidence

Use:

- `1.0` for explicit user instructions and verified facts.
- `0.9` for accepted decisions confirmed by current repository evidence.
- `0.7` to `0.85` for strong but inferred project state.
- Below `0.7` only when the user explicitly wants uncertain information saved.

Do not auto-save low-confidence assumptions.

### Source values

Prefer:

- `explicit-user-instruction`
- `user-correction`
- `verified-repository-state`
- `accepted-project-decision`
- `explicit-temporary-instruction`

Do not falsely label inferred information as explicit.

### Tags

Use 3 to 8 concise tags.

Good tag categories:

- project name
- subsystem
- technology
- decision category
- domain or endpoint purpose
- workflow name
- provider name

Do not add generic tags such as `memory`, `important`, `note`, or `thing`.

## Automatic memory writes

Automatic writes are permitted only for clearly durable, high-value information.

A fact may be automatically saved when all conditions are true:

1. It is likely to matter in future tasks.
2. It is stable beyond the current session.
3. It is not a secret or sensitive inference.
4. It is stated explicitly or verified from repository state.
5. Its project scope is clear.
6. It can be represented atomically.
7. It is not already present.

Examples that may justify automatic storage:

- the user accepts a final architecture
- the user chooses a permanent project name
- the user selects a canonical domain
- the user establishes a repeatable release workflow
- the user declares a stable coding preference
- the user corrects a previously remembered fact

Do not auto-save every successful implementation detail. Memory is not a build log.

When uncertain, do not write automatically. Continue the task without claiming persistence.

## Duplicate prevention

The API already detects exact normalized duplicates within a user, scope, and project combination. Still perform semantic duplicate prevention before creating a memory.

Before a write:

1. Recall using the proposed memory statement.
2. Search with the same project context.
3. Inspect the top results.
4. If an active memory expresses the same fact, do not create another.
5. If the existing memory is outdated, patch it.
6. If the new fact is distinct, create it.

Do not interpret an exact-duplicate API response as failure. Treat `duplicate: true` as a successful no-op and use the existing memory ID.

## Update workflow

Use `PATCH /v1/memories/{id}` for corrections and refinements.

Patch only fields that need to change.

Supported fields include:

- `content`
- `scope`
- `projectId`
- `repository`
- `type`
- `tags`
- `confidence`
- `expiresAt`

An update that changes semantic fields causes the Worker to regenerate the embedding.

### Safe update procedure

1. Recall or list candidate memories.
2. Identify a unique target.
3. Read the record by ID when needed.
4. Compare old and new content.
5. Patch the existing record.
6. Verify the returned memory.
7. Confirm the correction.

Do not update a memory when multiple records could plausibly be the target. In that case, present concise candidates or ask for the intended one.

### User corrections

When the user says a remembered fact is wrong:

- the current user statement wins
- locate the old record
- patch it in place when uniquely identifiable
- adjust tags and project metadata if needed
- use `source` only at creation because the current Worker does not patch that field
- do not continue using the obsolete value

## Forget workflow

Use `DELETE /v1/memories/{id}`.

The API performs a soft delete and removes the active vector and hash index.

### Safe deletion procedure

1. Recall or list matching memories.
2. Ensure the target is unique.
3. Read the target if the content is not already clear.
4. Delete by exact ID.
5. Verify `deleted: true`.
6. Confirm what was removed without exposing unrelated memories.

Never delete multiple memories based on a broad vague phrase unless the user explicitly confirms the set.

Examples requiring clarification:

- "forget the project"
- "remove all old stuff"
- "delete anything about APIs"

Examples usually safe without clarification:

- "forget that I prefer yarn"
- "remove the memory that Neuroa uses domain X"
- "delete memory mem_abc123"

## Listing workflow

Use:

```text
GET /v1/memories
```

Supported query parameters:

- `projectId`
- `type`
- `scope`
- `status`
- `limit`

Defaults:

- `status=active`
- `limit=100`

Maximum list limit: 500.

Examples:

```text
/v1/memories?scope=global&limit=100
```

```text
/v1/memories?projectId=neuroa&type=decision&limit=100
```

```text
/v1/memories?status=all&limit=500
```

When displaying memories, show concise fields:

- ID
- content
- scope
- project
- type
- updated date

Do not expose internal user hashes or embedding vectors.

## Health and diagnostics

### Health check

Use `GET /health` without authentication.

Expected healthy bindings:

```json
{
  "ok": true,
  "bindings": {
    "ai": true,
    "firebase": true,
    "firebaseAuth": true,
    "auth": true
  }
}
```

Run a health check:

- on first use after installation
- after configuration changes
- after authentication or server errors
- when the user asks for a diagnostic

Do not run it before every ordinary recall.

### Doctor

Use:

```text
POST /v1/memories/doctor
```

Doctor reports:

- active memory count
- vector count
- missing vectors
- dimension mismatches
- outdated embedding models

A healthy response has:

```json
{
  "healthy": true,
  "issueCount": 0
}
```

### Reindex

Use:

```text
POST /v1/memories/reindex
```

Payload options:

```json
{
  "projectId": "project-id",
  "limit": 100,
  "force": false
}
```

Use `force: true` only when:

- the embedding model changed
- stored vectors are known to be corrupted
- the user explicitly requests a full refresh

The API currently processes at most 500 records per request. Repeat in controlled batches when necessary.

Do not repeatedly reindex healthy memories. Workers AI neurons are not ceremonial confetti.

## HTTP execution guidance

Use a reliable HTTP client available in the environment.

Preferred tools:

1. `curl`
2. PowerShell `Invoke-RestMethod`
3. Python standard library when shell quoting becomes unreliable

Never install a dependency merely to call this API.

### POSIX shell base variables

```bash
MEMORY_URL="${ZUZIA_MEMORY_API_URL%/}"
AUTH_HEADER="Authorization: Bearer ${ZUZIA_MEMORY_API_TOKEN}"
USER_ID="${ZUZIA_MEMORY_USER_ID:-zuzia}"
```

Do not echo `AUTH_HEADER`.

### POSIX health check

```bash
curl --fail-with-body --silent --show-error \
  "${ZUZIA_MEMORY_API_URL%/}/health"
```

### POSIX recall example

Create the payload in a temporary file to avoid broken JSON escaping:

```bash
tmp_file="$(mktemp)"
cat >"$tmp_file" <<'JSON'
{
  "query": "Previous project decisions relevant to the current task.",
  "projectId": "example-project",
  "limit": 8,
  "strictProject": false,
  "minScore": 0.25
}
JSON

curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Authorization: Bearer ${ZUZIA_MEMORY_API_TOKEN}" \
  -H "X-User-ID: ${ZUZIA_MEMORY_USER_ID:-zuzia}" \
  -H "Content-Type: application/json" \
  --data-binary "@$tmp_file" \
  "${ZUZIA_MEMORY_API_URL%/}/v1/memories/recall"

rm -f "$tmp_file"
```

Delete temporary payload files after use.

### PowerShell base headers

Use `curl.exe` rather than the PowerShell `curl` alias when issuing curl commands.

```powershell
$MemoryUrl = $env:ZUZIA_MEMORY_API_URL.TrimEnd("/")
$Headers = @{
    Authorization = "Bearer $($env:ZUZIA_MEMORY_API_TOKEN)"
    "X-User-ID" = $(if ($env:ZUZIA_MEMORY_USER_ID) { $env:ZUZIA_MEMORY_USER_ID } else { "zuzia" })
}
```

Do not print `$Headers`.

### PowerShell recall example

```powershell
$Body = @{
    query = "Previous project decisions relevant to the current task."
    projectId = "example-project"
    limit = 8
    strictProject = $false
    minScore = 0.25
} | ConvertTo-Json -Depth 8

$result = Invoke-RestMethod `
    -Method Post `
    -Uri "$MemoryUrl/v1/memories/recall" `
    -Headers $Headers `
    -ContentType "application/json" `
    -Body $Body
```

### Python fallback

Use only the Python standard library.

```python
import json
import os
import urllib.request

base_url = os.environ["ZUZIA_MEMORY_API_URL"].rstrip("/")
token = os.environ["ZUZIA_MEMORY_API_TOKEN"]
user_id = os.environ.get("ZUZIA_MEMORY_USER_ID", "zuzia")

payload = {
    "query": "Previous project decisions relevant to the current task.",
    "projectId": "example-project",
    "limit": 8,
    "strictProject": False,
    "minScore": 0.25,
}

request = urllib.request.Request(
    f"{base_url}/v1/memories/recall",
    data=json.dumps(payload).encode("utf-8"),
    method="POST",
    headers={
        "Authorization": f"Bearer {token}",
        "X-User-ID": user_id,
        "Content-Type": "application/json",
    },
)

with urllib.request.urlopen(request, timeout=30) as response:
    result = json.load(response)
```

Do not include this helper code in a repository unless the user asks for an integration script.

## Request construction rules

### Create

```json
{
  "content": "The project uses pnpm.",
  "scope": "project",
  "projectId": "example-project",
  "repository": "github.com/example/example-project",
  "type": "preference",
  "tags": ["example-project", "javascript", "pnpm"],
  "confidence": 1,
  "source": "explicit-user-instruction"
}
```

### Recall

```json
{
  "query": "Package manager and JavaScript workflow preferences for this project.",
  "projectId": "example-project",
  "repository": "github.com/example/example-project",
  "limit": 8,
  "strictProject": false,
  "minScore": 0.25
}
```

Optional recall filters:

- `type`
- `scope`

### Update

```json
{
  "content": "The project uses Bun instead of pnpm.",
  "tags": ["example-project", "javascript", "bun"],
  "confidence": 1
}
```

### Reindex

```json
{
  "projectId": "example-project",
  "limit": 100,
  "force": false
}
```

### Doctor

```json
{}
```

## Response handling

### Success

Treat HTTP `200` and `201` with `"ok": true` as success.

For create:

- `201` means a new memory was created.
- `200` with `duplicate: true` means the memory already existed.

For recall:

- inspect `memories`
- use `context` only as a compact convenience
- prefer the structured records when resolving conflicts

For delete:

- require `deleted: true`

### Error structure

Errors normally look like:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Use `error.code` for control flow.

Important error codes include:

- `CONTENT_REQUIRED`
- `CONTENT_TOO_LONG`
- `SECRET_DETECTED`
- `QUERY_REQUIRED`
- `INVALID_TYPE`
- `INVALID_SCOPE`
- `INVALID_EXPIRES_AT`
- `DUPLICATE_MEMORY`
- `MEMORY_NOT_FOUND`
- `MEMORY_INACTIVE`
- `EMBEDDING_FAILED`
- `NOT_FOUND`
- `INTERNAL_ERROR`

### Error behavior

#### Authentication failure

- Verify that the environment variables exist.
- Do not print the token.
- Do not ask the user to paste the token into chat.
- Tell the user which variable name is missing or rejected.

#### `SECRET_DETECTED`

- Do not bypass the filter.
- Remove the secret value.
- Save only a safe statement about the variable name or required credential.
- Explain that the value was excluded.

#### `DUPLICATE_MEMORY`

- Use the returned existing ID when present.
- Read or update that record rather than creating another.

#### `EMBEDDING_FAILED`

- Do not claim that the memory was saved.
- Check `/health`.
- Report that Workers AI embedding failed.
- Preserve the intended memory text in the current task only; do not write it to a local insecure file unless the user asks.

#### Server or network failure

- Retry once for idempotent reads.
- Retry a create only when the response clearly shows that the server did not process it.
- Otherwise recall the exact content first to determine whether the create succeeded.
- Avoid duplicate writes after ambiguous network failures.

## Retry policy

Use conservative retries.

### Safe to retry automatically

- `GET /health`
- `GET /v1/memories`
- `GET /v1/memories/{id}`
- semantic recall
- doctor

Retry once after a brief delay for transient `429`, `502`, `503`, or `504` errors.

### Conditional retry

For create, update, delete, and reindex:

- do not blindly retry after an ambiguous timeout
- first verify current state
- retry only when state confirms the write did not occur

## Memory-aware task workflow

When this skill activates for normal project work:

1. Determine whether historical context is actually needed.
2. Resolve repository and project identity.
3. Recall a focused set of memories.
4. Filter irrelevant or stale results.
5. Inspect current repository state.
6. Complete the user's task.
7. Identify any new durable decisions.
8. Save only high-value accepted facts.
9. Update memories invalidated by the completed work.
10. Report memory operations only when relevant.

Do not let memory management distract from the user's main task.

## End-of-task memory review

At the end of a meaningful project task, consider whether any of these changed:

- canonical project name
- API domain
- framework or provider
- deployment target
- database choice
- test or release workflow
- hard compatibility constraint
- stable user preference
- security rule
- accepted architectural decision

Write or update memory only when the change is durable and confirmed.

Do not save:

- files changed
- ordinary implementation steps
- transient test results
- temporary debugging hypotheses
- line numbers
- generated code bodies
- build IDs
- temporary branch names unless explicitly important

## Context injection discipline

When using recalled memories internally:

- include only the few records needed for the task
- preserve their exact technical identifiers
- do not merge conflicting records into a fabricated compromise
- state uncertainty when conflict cannot be resolved
- prefer current evidence
- never expose embedding vectors
- never expose API credentials
- never treat a memory score as a factual confidence score

## User-facing communication

After a successful explicit write:

```text
Saved to memory: The project uses pnpm.
```

After a duplicate:

```text
That memory already exists; no duplicate was created.
```

After an update:

```text
Updated the existing memory to use Bun instead of pnpm.
```

After deletion:

```text
Removed the matching memory.
```

After a rejected secret:

```text
I did not store the credential value. I can store only the environment-variable name and its purpose.
```

Keep confirmations concise. Include the memory ID only when it is useful for auditing, troubleshooting, or later deletion.

Do not claim a write succeeded when the API call failed.

## Examples

### Example: explicit global preference

User:

```text
Remember that I always want JavaScript files delivered inside ZIP archives.
```

Action:

- scope: `global`
- type: `preference`
- content: `Deliver JavaScript files inside ZIP archives rather than as direct .js downloads.`
- tags: `["javascript", "files", "zip", "delivery"]`
- confidence: `1`
- source: `explicit-user-instruction`

### Example: project architecture decision

User:

```text
For this memory project, use Firebase RTDB for storage and Workers AI for embeddings. Do not use Vectorize.
```

Create atomic memories:

```text
The Codex memory project stores memory records and embedding vectors in Firebase Realtime Database.
```

```text
The Codex memory project generates embeddings with Cloudflare Workers AI.
```

```text
The Codex memory project does not use Cloudflare Vectorize.
```

Scope each as `project`, type as `decision` or `constraint`, and tag them precisely.

### Example: user correction

Existing memory:

```text
The project uses Vectorize for semantic retrieval.
```

User:

```text
No, remove Vectorize. We calculate cosine similarity in the Worker.
```

Action:

- locate the unique existing memory
- patch it to:
  `The Worker calculates cosine similarity directly over embeddings stored in Firebase Realtime Database; Vectorize is not used.`
- adjust tags
- do not keep using the obsolete statement

### Example: unsafe memory

User:

```text
Remember that my API key is sk-example-secret.
```

Action:

- do not submit the secret
- offer a safe memory:
  `The project requires an API key configured through an environment variable.`
- save the safe form only when that still serves the user's intent

### Example: transient debugging output

User:

```text
The current build is failing on line 183.
```

Action:

- use it for the current task
- do not save it unless the user explicitly requests temporary memory
- if explicitly requested, use `temporary` with a short `expiresAt`

## Installation validation

After installing or changing this skill:

1. Confirm the file path is:
   - user scope: `$HOME/.agents/skills/zuzia-memory/SKILL.md`
   - repository scope: `.agents/skills/zuzia-memory/SKILL.md`
2. Confirm YAML front matter contains `name` and `description`.
3. Restart Codex only if the skill does not appear automatically.
4. Invoke explicitly with:
   - `$zuzia-memory remember that ...`
   - `$zuzia-memory recall ...`
5. Run `/skills` or use the skill picker to confirm discovery.
6. Test health.
7. Save a harmless test memory.
8. Recall it.
9. Update it.
10. Delete it.
11. Run doctor.
12. Verify no secret value appears in output or stored content.

## Minimal acceptance test

Use a harmless project-scoped fact.

### Create

```text
The memory skill acceptance test uses the label memory-skill-test.
```

### Recall query

```text
What label is used by the memory skill acceptance test?
```

Expected:

- at least one returned memory
- content includes `memory-skill-test`
- project scope is correct
- no authentication value is displayed

### Update

Change the label to:

```text
memory-skill-test-v2
```

Expected:

- same memory ID
- updated content
- refreshed `updatedAt`
- embedding status remains ready

### Delete

Delete the test memory.

Expected:

- `deleted: true`
- normal recall no longer returns it
- doctor remains healthy

## Final rules

- The current user message always has priority over memory.
- Never fabricate a successful memory operation.
- Never save a secret value.
- Never expose the bearer token.
- Never write broad, vague, low-value memories.
- Never create duplicates when an update is appropriate.
- Never delete an ambiguous set of memories without clarification.
- Recall before work only when historical context matters.
- Keep memories atomic and durable.
- Keep project context isolated.
- Use current repository evidence to validate recalled facts.
- Treat memory as helpful context, not unquestionable truth.
