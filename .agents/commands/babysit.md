# Babysit PR (`/babysit`)

Keep a PR merge-ready by triaging comments, resolving clear conflicts, and fixing CI. One invocation = one pass. Designed to be wrapped in `/loop` for continuous babysitting.

## Scope

- Default target is the current branch's GitHub PR. If the user provides a PR URL or `OWNER/REPO#N`, use that instead.
- The deliverable is a PR that no longer needs the user to unblock it: green CI, no clear unresolved review threads, no clear conflicts, branch up to date with base.
- Don't expand scope beyond what's needed to merge. No drive-by refactors, no unrelated cleanups.
- Don't change draft status, close/reopen the PR, force-push, or rewrite history.

## Operating Mode

- One pass per invocation. Do the work, push if needed, report status, exit. Don't sleep or poll inside the command — that's the loop's job.
- If nothing actionable changed since the previous pass (no new comments, CI still green, no new conflicts), say so explicitly and exit fast.
- Never block on a plan confirmation. Inspect, decide, fix, push.
- Only act on **clear** items. Ambiguous review feedback, non-trivial conflict resolution, and unrelated CI failures get reported as blockers, not silently muddled through.
- Don't edit files outside the PR's original changed-file set unless a comment or CI failure requires it.

## Prerequisites

- `gh auth status` must succeed.
- Current branch must have a PR (use `gh pr view --json number,headRefName,baseRefName,mergeable,mergeStateStatus,state`) unless one was passed in.

## Pass Steps

Run these in order. Stop early if a hard blocker appears (no auth, no write access, destructive conflict, etc.).

### 1. Snapshot PR state

```
gh pr view <n> --json number,headRefName,baseRefName,mergeable,mergeStateStatus,state,isDraft,statusCheckRollup
```

Capture: mergeable (`MERGEABLE` / `CONFLICTING` / `UNKNOWN`), mergeStateStatus (`CLEAN` / `BLOCKED` / `BEHIND` / `DIRTY` / `UNSTABLE`), CI rollup, draft status.

### 2. Sync with base

- If `mergeStateStatus` is `BEHIND` and there are no conflicts, merge base into the branch (`git fetch origin && git merge origin/<base>`) and push.
- If conflicts arise during the merge: see step 3.

### 3. Resolve clear conflicts

- A "clear" conflict is one where intent is unambiguous: pure additions on both sides that don't overlap semantically, lockfile/snapshot regenerations, formatting-only diffs, or import-list merges.
- For lockfiles: regenerate via the project's install command (inside Docker for this repo) rather than hand-merging.
- Anything involving overlapping logic, schema/migration ordering, or behavior changes on both sides is **not clear** — abort the merge (`git merge --abort`) and report it as a blocker.
- After resolving, run the relevant lint/typecheck/test scripts for changed areas before pushing.

### 4. Triage unresolved review threads

Use GraphQL to list **unresolved** threads only (`pullRequest.reviewThreads`, filter `isResolved == false`). REST comment lists are not authoritative for resolution state.

For each unresolved thread, classify:

- **Clear actionable** — fix it, reply inline with what changed, resolve the thread.
- **Already addressed** in a later commit — reply with the commit/line reference, resolve the thread.
- **Reply-only** (question, clarification, "won't do" with a reason) — reply, do not resolve unless the reviewer's intent is plainly satisfied.
- **Ambiguous / needs human judgment** — leave it. Report it in the final summary so the user can decide.

Never resolve a thread you didn't actually address.

### 5. Fix CI

- Pull failing check details with `gh pr checks <n>` and `gh run view --log-failed` for each failure.
- Categorize failures:
  - **In scope** — lint, typecheck, test failures caused by this PR's changes. Fix them.
  - **Flake** — known-flaky check that passed on retry historically. Re-run with `gh run rerun --failed`. Don't keep re-running indefinitely; one retry per pass.
  - **Out of scope** — failure rooted in `main` or unrelated infra. Report as a blocker, do not paper over.
- For this repo, fixes must use the Docker-prefixed scripts in `CLAUDE.md`. Never run frontend commands locally — if a frontend check fails, fix the code based on log output and let the user verify.

### 6. Push and verify

- Commit fixes with conventional-commit messages scoped to what changed (`fix(scope): ...`, `chore(scope): ...`).
- Push without `--force`. If push is rejected, fetch and rebase/merge as appropriate, then push again — never force-push to a shared branch unless the user explicitly asked for it on this PR.
- Re-snapshot PR state after pushing so the final report reflects post-push status.

## Final Response

Keep it short. Report:

- PR status: merge-ready / blocked / waiting-on-CI.
- What this pass changed: commits pushed, threads resolved, conflicts merged, CI failures fixed.
- What this pass deliberately did **not** touch: ambiguous threads (with thread URLs), non-clear conflicts, out-of-scope CI failures.
- Whether another pass is likely to make progress (so the wrapping `/loop` knows whether to keep going).

If the PR is merge-ready, say so plainly and stop — don't keep looping for no reason.
