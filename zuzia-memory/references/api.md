# Zuzia Memory API

## Contents

- Authentication
- Endpoints
- Request payloads
- HTTP execution
- Response handling
- Errors and retries
- Health, doctor, and reindex

## Authentication

Use `ZUZIA_MEMORY_API_URL` without a trailing slash. Send these headers on protected requests:

```text
Authorization: Bearer $ZUZIA_MEMORY_API_TOKEN
Content-Type: application/json
X-User-ID: $ZUZIA_MEMORY_USER_ID
```

Default `X-User-ID` to `zuzia` when the variable is absent. Never print constructed authorization headers.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check service bindings; no authentication |
| `POST` | `/v1/memories` | Create a memory |
| `POST` | `/v1/memories/recall` | Semantic retrieval |
| `GET` | `/v1/memories` | List and filter memories |
| `GET` | `/v1/memories/{id}` | Read one memory |
| `PATCH` | `/v1/memories/{id}` | Update one active memory |
| `DELETE` | `/v1/memories/{id}` | Soft-delete one memory |
| `POST` | `/v1/memories/reindex` | Recreate embeddings |
| `POST` | `/v1/memories/doctor` | Inspect consistency and embedding health |

## Request payloads

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
  "source": "explicit-user-instruction",
  "expiresAt": null
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

Optional recall filters are `type` and `scope`. The maximum result limit is 20.

### Update

Patch only changed fields. Supported fields are `content`, `scope`, `projectId`, `repository`, `type`, `tags`, `confidence`, and `expiresAt`.

```json
{
  "content": "The project uses Bun instead of pnpm.",
  "tags": ["example-project", "javascript", "bun"],
  "confidence": 1
}
```

Semantic changes regenerate the embedding.

### List

Use `GET /v1/memories` with optional `projectId`, `type`, `scope`, `status`, and `limit`. Defaults are `status=active` and `limit=100`; maximum list limit is 500.

Display only ID, content, scope, project, type, and updated date unless more is explicitly needed.

### Doctor

```json
{}
```

### Reindex

```json
{
  "projectId": "example-project",
  "limit": 100,
  "force": false
}
```

The API processes at most 500 records per request.

## HTTP execution

Use an available native client. Prefer `curl`, PowerShell `Invoke-RestMethod`, then Python standard library. Do not install a dependency merely to call the API.

In PowerShell, use `curl.exe` rather than the `curl` alias when issuing curl commands. Resolve configuration from process scope first and Windows User scope second so persisted settings are available to an already-running Codex instance. Prefer `Invoke-RestMethod` with an in-memory JSON body:

```powershell
function Get-MemorySetting {
    param([Parameter(Mandatory)][string]$Name)

    $Value = [Environment]::GetEnvironmentVariable($Name, "Process")
    if ([string]::IsNullOrWhiteSpace($Value)) {
        $Value = [Environment]::GetEnvironmentVariable($Name, "User")
    }
    return $Value
}

$MemoryApiUrl = Get-MemorySetting "ZUZIA_MEMORY_API_URL"
$MemoryApiToken = Get-MemorySetting "ZUZIA_MEMORY_API_TOKEN"
$MemoryUserId = Get-MemorySetting "ZUZIA_MEMORY_USER_ID"
if ([string]::IsNullOrWhiteSpace($MemoryUserId)) {
    $MemoryUserId = "zuzia"
}
if ([string]::IsNullOrWhiteSpace($MemoryApiUrl) -or [string]::IsNullOrWhiteSpace($MemoryApiToken)) {
    throw "Zuzia Memory configuration is incomplete."
}

$MemoryUrl = $MemoryApiUrl.TrimEnd("/")
$Headers = @{
    Authorization = "Bearer $MemoryApiToken"
    "X-User-ID" = $MemoryUserId
}
$Body = @{
    query = "Previous durable decisions relevant to the current task."
    projectId = "example-project"
    limit = 8
    strictProject = $false
    minScore = 0.25
} | ConvertTo-Json -Depth 8
$Result = Invoke-RestMethod -Method Post -Uri "$MemoryUrl/v1/memories/recall" -Headers $Headers -ContentType "application/json" -Body $Body
```

Do not output `$MemoryApiToken` or `$Headers`. On POSIX, use a temporary JSON file for complex payloads and delete it afterward.

## Response handling

Treat HTTP `200` and `201` with `"ok": true` as success.

- Create: `201` means created; `200` with `duplicate: true` means existing record reused.
- Recall: inspect `memories`; use `context` only as a compact convenience.
- Delete: require `deleted: true`.

Errors normally contain:

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

Use `error.code` for control flow. Important codes include:

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

## Errors and retries

### Authentication

Verify environment-variable presence without printing values. Name the missing or rejected variable. Never ask the user to paste the token into chat.

### `SECRET_DETECTED`

Do not bypass the filter. Remove the secret, retain only safe metadata, and explain the exclusion.

### `DUPLICATE_MEMORY`

Use the existing returned ID when present. Read or update it instead of creating another record.

### `EMBEDDING_FAILED`

Do not claim persistence. Check `/health`, report the Workers AI embedding failure, and retain intended content only in current task context unless the user requests a safe local artifact.

### Network or server failure

Retry idempotent reads once after a brief delay for `429`, `502`, `503`, or `504`.

For create, update, delete, or reindex, never retry blindly after an ambiguous timeout. Verify current state first. For an ambiguous create, recall the exact content to determine whether it succeeded.

## Health, doctor, and reindex

Run unauthenticated `GET /health` on first use after installation, after configuration changes, after authentication or server errors, or on explicit diagnostic request. Do not run it before every recall.

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

Use `POST /v1/memories/doctor` to inspect active memory count, vector count, missing vectors, dimension mismatches, and outdated embedding models. A healthy response has `healthy: true` and `issueCount: 0`.

Use `force: true` for reindex only when the embedding model changed, vectors are known to be corrupt, or the user explicitly requests a full refresh. Process larger sets in controlled batches. Do not repeatedly reindex healthy records.
