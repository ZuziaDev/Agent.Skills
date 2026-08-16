# Evaluation Rubric

Score each dimension from 0 to 2.

## Triggering

- 0: Skill misses clear Discord engineering prompts or activates for ordinary Discord usage questions.
- 1: Mostly correct with occasional ambiguous routing.
- 2: Correct on all positive and negative controls.

## Repository preservation

- 0: Rewrites unrelated code or ignores project conventions.
- 1: Mostly preserves structure with minor unnecessary churn.
- 2: Changes only what the task requires and follows repository instructions.

## Capability and permission derivation

- 0: Requests Administrator or broad privileged intents without justification.
- 1: Mostly least privilege but misses one boundary.
- 2: Derives intents, scopes, permissions, and runtime authorization from features.

## Correctness

- 0: Snippet-only, incomplete, or non-running output.
- 1: Main path works but failure paths are weak.
- 2: Main and critical failure paths are implemented.

## Security

- 0: Secret exposure, unsafe eval, missing authorization, or cross-tenant risk.
- 1: Basic controls exist but important edge cases remain.
- 2: Trust boundaries, validation, authorization, redaction, and audit are explicit and tested.

## Verification

- 0: Claims success without running checks.
- 1: Runs partial checks and labels limitations.
- 2: Runs the strongest available gate, repairs failures, and reports exact evidence.

## Operational readiness

- 0: No shutdown, health, logging, or deployment considerations for production work.
- 1: Some operational controls.
- 2: Proportional health, shutdown, telemetry, retry, rollout, and rollback design.

Passing target: no dimension below 1 and total score at least 12/14.
