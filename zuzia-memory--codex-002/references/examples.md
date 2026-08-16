# Examples and Validation

## Contents

- Explicit global preference
- Project architecture decision
- User correction
- Unsafe memory
- Transient output
- Installation validation
- Acceptance test

## Explicit global preference

User request:

```text
Remember that I always want JavaScript files delivered inside ZIP archives.
```

Create:

- scope: `global`
- type: `preference`
- content: `Deliver JavaScript files inside ZIP archives rather than as direct .js downloads.`
- tags: `javascript`, `files`, `zip`, `delivery`
- confidence: `1`
- source: `explicit-user-instruction`

## Project architecture decision

User request:

```text
For this memory project, use Firebase RTDB for storage and Workers AI for embeddings. Do not use Vectorize.
```

Create three atomic project records:

```text
The Codex memory project stores memory records and embedding vectors in Firebase Realtime Database.
```

```text
The Codex memory project generates embeddings with Cloudflare Workers AI.
```

```text
The Codex memory project does not use Cloudflare Vectorize.
```

Use `decision` or `constraint` types and precise tags.

## User correction

Existing memory:

```text
The project uses Vectorize for semantic retrieval.
```

User correction:

```text
No, remove Vectorize. We calculate cosine similarity in the Worker.
```

Locate the unique existing record and patch it to a precise statement such as:

```text
The Worker calculates cosine similarity directly over embeddings stored in Firebase Realtime Database; Vectorize is not used.
```

Adjust tags and stop applying the obsolete fact.

## Unsafe memory

If a user asks to remember a credential value, do not submit it. Offer or store only a safe statement such as:

```text
The project requires an API key configured through an environment variable.
```

Save the safe form only when it still serves the user's intent.

## Transient output

Do not save a current build failure, line number, raw log, or temporary debugging output unless the user explicitly requests temporary memory. If explicitly requested, use type `temporary`, scope `session`, and a short `expiresAt`.

## Installation validation

After installation or changes:

1. Confirm the user-scope path is `$CODEX_HOME/skills/zuzia-memory/SKILL.md`, falling back to `~/.codex/skills/zuzia-memory/SKILL.md` when `CODEX_HOME` is unset.
2. Confirm frontmatter contains only `name` and `description`.
3. Use the skill picker or explicit `$zuzia-memory` invocation to confirm discovery.
4. Restart Codex only when discovery does not refresh automatically.
5. Test `/health`.
6. Create a harmless test memory.
7. Recall it.
8. Update it.
9. Delete it.
10. Run doctor.
11. Verify no credential appears in output or storage.

## Acceptance test

Create a harmless project-scoped fact:

```text
The memory skill acceptance test uses the label memory-skill-test.
```

Recall with:

```text
What label is used by the memory skill acceptance test?
```

Require the returned content to contain `memory-skill-test`, match project scope, and expose no authentication value.

Update the same memory to use `memory-skill-test-v2`. Require the same ID, a refreshed `updatedAt`, and ready embedding status.

Delete the test memory. Require `deleted: true`, confirm normal recall no longer returns it, and run doctor to confirm health.
