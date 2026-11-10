# Status

> **Last updated**: 2026-11-10

## Works

- The memory bank, `AGENTS.md`, `CLAUDE.md` and `scripts/check-memory.py` (2026-11-10).
- The requirements are written down in `docs/spec.md` (2026-11-10).
- mae settled numbering, seat values, pair search order, invalid input, interaction mode and agent tooling (2026-11-10); see `decisions.md`.

## In progress

- Nothing.

## Next

1. Settle the tooling question below with mae, and record the answer in `decisions.md`.
2. Agree a build plan with mae, then scaffold the TypeScript project and add its commands to `context.md`.
3. Build the six functions in §4, each commented as §6 asks, and the command loop.
4. Write the tests for the four room states in §5.

## Open questions

- **Tooling** (2026-11-10): recommended to mae, awaiting an answer. Node.js (22.18 or later) runs the TypeScript files directly through its built-in type stripping; `typescript` is the only dependency, used for `tsc --noEmit` type checks; tests use the built-in `node:test` and `node:assert`. Alternatives offered: compile with `tsc` to JavaScript first, or add `tsx` for running and Vitest for tests.

## Known problems

- None.
