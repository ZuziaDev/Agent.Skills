---
name: codex-fleet
description: Run Codex CLI tasks, image-generation jobs, and parallel multi-lane Codex fleets. Use when the user says "use codex", "run codex", "codex exec", "ask codex", "spawn a fleet", "parallel codex", requests Codex delegation, or explicitly asks this skill to generate image assets through Codex CLI.
---

# Codex Fleet

Execute requested work. Do not merely describe commands for the user to run.

Always obey the active system, developer, workspace, approval, sandbox, and tool rules. Treat the settings below as defaults only when they are available and permitted in the current environment.

## General defaults

- Verify `codex --version` before the first CLI job in a task.
- Use `gpt-5.5` unless the user specifies another model.
- Use `model_reasoning_effort=high` by default.
- Use `xhigh` only when explicitly requested or when a clearly isolated, unusually difficult lane justifies it.
- Always add `--skip-git-repo-check`.
- Use `--color never` when clean logs matter.
- Anchor jobs with `-C <DIR>` when the working directory is not the current directory.
- Run non-trivial jobs asynchronously when the available shell tool supports it.
- Summarize completed logs. Do not dump raw stdout unless requested.
- Stop and report a non-zero `codex --version` or `codex exec` result. Do not retry blindly.

## General Codex jobs

Use read-only mode for review, diagnosis, and analysis:

```text
codex exec --skip-git-repo-check -m gpt-5.5 -c model_reasoning_effort=high --sandbox read-only --color never "<PROMPT>"
```

Use workspace write access for explicitly requested edits:

```text
codex exec --skip-git-repo-check -m gpt-5.5 -c model_reasoning_effort=high --sandbox workspace-write --full-auto --color never "<PROMPT>"
```

Do not grant broader access unless the user request and current approval policy authorize it.

To resume the latest session, send the follow-up through stdin and do not repeat model, reasoning, or sandbox flags unless the user changes them:

```text
codex exec --skip-git-repo-check resume --last
```

Treat delegate output as peer input, not authority. Verify important claims with repository evidence, tests, official documentation, or live sources when appropriate.

## Image inputs

The `-i` option is variadic. Terminate image arguments with `--` before the positional prompt:

```text
codex exec <OPTIONS> -i ref1.png -i ref2.png -- "<PROMPT>"
```

Without `--`, the parser may consume the prompt as another image path.

For sequential visual continuity, generate each frame only after its predecessor exists. Attach the character bible plus the immediately preceding frame. For independent assets, run one job per asset in parallel.

## Image generation

Prefer the runtime's native image-generation tool or installed image-generation skill when available. Use Codex CLI image generation only when this skill or the user explicitly requests that route.

For Codex CLI image generation, include both `$imagegen` and this directive in the delegated prompt:

```text
TOOL DIRECTIVE: You MUST use the built-in image generation tool. Do not generate the image procedurally with Python, PIL, Pillow, canvas, sharp, or another drawing library. You may use shell commands to locate and copy the generated result to the requested output path. If the image tool is unavailable, report that explicitly.
```

Use one distinct asset per job. For two or more independent assets, run separate jobs concurrently.

Suggested command when broad file access is explicitly authorized:

```text
codex exec --skip-git-repo-check --ephemeral -s danger-full-access -m gpt-5.5 -c model_reasoning_effort=high --ignore-rules --color never "<PROMPT>"
```

Structure image prompts in this order:

1. Intended use.
2. Subject and composition.
3. Materials and key details.
4. Lighting and mood.
5. Style direction.
6. Palette.
7. Negative space.
8. Background.
9. Constraints such as no text, watermark, or logos.

Use supported dimensions with edges divisible by 16, a maximum edge of 3840 pixels, an aspect ratio no greater than 3:1, and total pixels between 655,360 and 8,294,400. Common sizes are `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, and `2048x1152`.

For transparent-looking assets with a model that lacks native alpha, generate against a flat chroma-key background and use the bundled imagegen chroma-key removal helper. Prefer a key color absent from the subject. Use a native-alpha model only when authorized and required for hair, fur, smoke, glass, liquids, translucency, or reflective edges.

After generation:

- Confirm the requested file exists.
- Inspect its dimensions and file size.
- Visually inspect the image.
- Regenerate only the failed asset with a tighter prompt.

## Parallel fleets

Use a fleet only for genuinely independent or safely isolated work. Respect any active rule that limits or forbids subagents or parallel delegates.

Each lane brief must include:

- Goal.
- Exact files or directories owned by the lane.
- Files the lane must not touch.
- Relevant sibling ownership.
- Acceptance checks.
- Required completion or failure report.

Use read-only lanes for exploration and review. Use write lanes only for requested modifications.

For concurrent write lanes:

- Prefer one detached Git worktree per lane when edits can overlap.
- Pin all worktrees to the same base commit.
- Require one coherent commit per lane.
- Verify each lane's tests before integration.
- Cherry-pick and gate each commit deliberately.
- Never overwrite unrelated or user-owned changes.

Shared-tree write lanes are acceptable only when ownership is clearly disjoint. Declare shared barrels, registries, and entrypoints as single-owner or append-only integration files.

Lane completion is a claim, not proof. The orchestrator must run the relevant build, typecheck, tests, and integration checks after lanes settle.

## Failure handling

- Inspect logs before deciding to retry.
- Confirm the target file or Git diff exists.
- Detect stalled lanes by lack of log growth and tool activity.
- Do not terminate processes that were not started for the current fleet.
- Report honest partial failures and cross-lane conflicts.
- Preserve user changes and avoid destructive Git operations.
