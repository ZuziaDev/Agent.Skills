# Memory Policy

## Contents

- Memory scopes
- Memory types
- Quality and atomicity
- Secrets and privacy
- Metadata
- Duplicate prevention
- Project identity sanitization

## Memory scopes

Choose exactly one scope:

- `global`: durable user-wide preferences or facts that apply across repositories.
- `project`: repository- or product-specific decisions, facts, workflows, and constraints.
- `session`: intentionally temporary cross-task context. Normally include `expiresAt`.

Include both `projectId` and `repository` for project memory when they can be determined safely.

## Memory types

Choose the narrowest valid type:

| Type | Use |
|---|---|
| `preference` | Stable tool, format, style, behavior, or workflow preference |
| `identity` | User-approved identity, brand, account, role, or naming fact |
| `project` | Stable project purpose, ownership, domain, or component mapping |
| `decision` | Accepted choice between alternatives |
| `workflow` | Repeatable sequence, command, release process, or procedure |
| `environment` | Runtime, OS, hosting, device, path, version, or infrastructure fact |
| `constraint` | Hard rule, compatibility need, security boundary, or prohibition |
| `temporary` | Deliberately short-lived fact with an expiration date |

## Quality and atomicity

Write memories that are:

- atomic;
- concise and preferably under 500 characters;
- complete statements;
- durable and useful in future work;
- unambiguous;
- scoped and tagged precisely;
- free of credentials and unsupported claims.

The service limit is 12,000 characters. Do not use it to store large generated code or logs.

Prefer separate records for independent facts. Do not combine package manager, runtime, database, branding, and release process in one record.

Preserve exact technical identifiers when important. Do not turn a preference into a universal fact. Do not store repository details that are reliably available from current files unless the user wants them durable across repositories.

## Secrets and privacy

Never send these as memory content:

- passwords, API keys, access or refresh tokens;
- cookies, authorization headers, session identifiers;
- private keys, SSH keys, service-account JSON;
- client secrets, database passwords, recovery codes;
- `.env` values, encryption keys, credential-bearing signed URLs.

Store only a credential's environment-variable name, provider, or purpose when useful. Before every create or update:

1. Inspect content for secret-like values.
2. Remove credential values.
3. Keep only safe configuration metadata.
4. Reject the write if the useful fact cannot be separated safely.
5. Tell the user that the secret value was excluded.

Do not infer or automatically store sensitive personal details. Store personal information only on explicit request or when clearly required as a durable operational preference, and use the minimum necessary detail.

## Metadata

### Confidence

- `1.0`: explicit user instruction or verified fact.
- `0.9`: accepted decision confirmed by current repository evidence.
- `0.7` to `0.85`: strong but inferred project state.
- Below `0.7`: use only when the user explicitly requests storage of uncertainty.

Do not automatically save low-confidence assumptions.

### Source

Prefer:

- `explicit-user-instruction`
- `user-correction`
- `verified-repository-state`
- `accepted-project-decision`
- `explicit-temporary-instruction`

Do not label inferred information as explicit. `source` is creation-only in the current API.

### Tags

Use 3 to 8 concise tags drawn from:

- project name;
- subsystem;
- technology or provider;
- decision category;
- domain or endpoint purpose;
- workflow name.

Avoid generic tags such as `memory`, `important`, `note`, or `thing`.

## Duplicate prevention

Before creating:

1. Recall using the proposed statement.
2. Use the same project context.
3. Inspect the top structured results.
4. Skip creation if an active record expresses the same fact.
5. Patch a unique outdated record.
6. Create only when the fact is distinct.

Treat an exact duplicate response as success and use the existing ID.

## Project identity sanitization

Prefer a sanitized remote origin as `repository`.

- Remove HTTPS credentials and user information.
- Never store tokens embedded in a URL.
- Never store private SSH key paths.
- Allow a normal SSH remote such as `git@github.com:owner/repo.git`.
- Normalize obvious equivalent remotes when practical.
- If no remote exists, use an absolute root only when it exposes no personal or secret-bearing segment.
- Otherwise use the final folder name.

Derive `projectId` from an explicit name, remote repository name, trusted root package name, or root folder name. Normalize it to lowercase kebab-case by replacing separators with `-`, collapsing repeated hyphens, and trimming boundaries.
