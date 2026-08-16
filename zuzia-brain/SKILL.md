---
name: zuzia-brain
description: Access and manage the shared Obsidian-compatible Zuzia Brain vault. Use when the user asks to list, read, search, write, move, delete, inspect, or index vault files, mentions zuzia-brain or vault_list, or when a Codex task incorrectly tries MCP resources or zuzia-memory for vault operations.
---

# Zuzia Brain

Use Zuzia Brain as the shared Markdown vault. Do not substitute the separate `zuzia-memory` API.

## Tool routing

1. Prefer the callable `mcp__zuzia_brain__*` tool matching the request.
2. For file listings, call `mcp__zuzia_brain__vault_list`; do not call `resources/list` or generic MCP resource tools. Zuzia Brain exposes tools, not resources.
3. Use `recursive: true` and a sufficient `limit` when the callable schema supports them.
4. If the MCP tool is absent from the current task snapshot, use `scripts/invoke-vault-tool.ps1` as the fallback. Do not claim the vault is unavailable before trying it.

## Fallback

Run from PowerShell:

```powershell
& "$env:USERPROFILE\.codex\skills\zuzia-brain\scripts\invoke-vault-tool.ps1" -Tool vault_list -ArgumentsJson '{"limit":100,"recursive":true}'
```

The script reads `ZUZIA_BRAIN_KEY` from Process scope, then Windows User scope. Never print or persist the key. It uses `ZUZIA_BRAIN_MCP_URL` when set, otherwise `https://zuzia-brain.zuzia.dev/mcp`.

Supported public tools currently include `vault_list`, `vault_read`, `vault_search`, `vault_write`, `vault_move`, `vault_delete`, and `vault_stats`.

## Safety

- Treat list, read, search, and stats as read-only.
- Write, move, or delete only when the user explicitly requests that mutation.
- Preserve Markdown paths and content.
- Never send credentials into vault content.
- Report a missing `ZUZIA_BRAIN_KEY` by variable name only.
