---
name: zuzia-fleet
description: Use when the user says Zuzia Fleet, asks Claude Code to run or ask Codex, requests codex exec, wants parallel Codex lanes, or requests image assets through Codex CLI.
argument-hint: <task>
allowed-tools: Bash(*), Read, Grep, Glob
---

# Zuzia Fleet

Execute the requested work through Codex CLI. Do not merely print commands unless the user explicitly asks for commands only.

## Mandatory preflight

Before the first Codex job in a task:

1. Run `codex --version` and `codex exec --help`.
2. Stop and report the error if either command exits non-zero.
3. Use `gpt-5.5` with `model_reasoning_effort=high` by default. Use `xhigh` only when the user explicitly requests it or the task is unusually difficult.
4. Always pass `--skip-git-repo-check`, `-C <ABSOLUTE_DIR>`, and `--color never`.

Detect CLI compatibility from help output. When global `--ask-for-approval` is available, put `--ask-for-approval never` before `exec`. If `codex exec --help` exposes `--full-auto` instead, use `--full-auto` for write jobs. Never pass an unsupported flag.

## Job templates

Current CLI read-only job:

```text
codex --ask-for-approval never exec --skip-git-repo-check -C <DIR> -m gpt-5.5 -c model_reasoning_effort=high --sandbox read-only --color never <PROMPT>
```

Current CLI write job:

```text
codex --ask-for-approval never exec --skip-git-repo-check -C <DIR> -m gpt-5.5 -c model_reasoning_effort=high --sandbox workspace-write --color never <PROMPT>
```

Use stdin for multiline or untrusted prompts so shell quoting cannot reinterpret them. For non-trivial jobs, use Claude Code background execution or a platform-native background process, capture per-job logs, and keep the conversation responsive. Summarize logs; do not dump raw stdout unless requested.

Resume a job by piping the follow-up prompt into `codex exec --skip-git-repo-check resume --last`. Inspect the prior exit code and logs first.

## Delegation contract

Every lane brief must state:

- goal and acceptance criteria;
- absolute working directory;
- owned files and forbidden files;
- sibling lane ownership;
- required tests and final report format.

Treat Codex output as peer work. Inspect files or diffs and run relevant verification before reporting success.

## Fleet rules

Use multiple lanes only when work is genuinely independent or safely isolated.

- Exploration and review lanes use `read-only`.
- Overlapping write lanes use detached Git worktrees created from the same base commit.
- Shared-tree write lanes are allowed only for explicitly disjoint files.
- Each write lane produces one focused commit when worktrees are used.
- The orchestrator checks ownership, diffs, tests, and conflicts before cherry-picking.
- Do not let two lanes edit the same file. Do not terminate unrelated processes.

If a lane fails, inspect its exit code, log, filesystem state, and diff. Do not retry blindly. Preserve successful independent results and report partial completion precisely.

## Images

For image generation, include `$imagegen` in the Codex prompt and explicitly require use of the image-generation tool. Attach input images with repeated `-i`; terminate the image list before the prompt. Run independent assets in parallel. Verify output path, file type, dimensions, and visual quality before delivery.
