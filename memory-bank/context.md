# Context

> **Last updated**: 2026-11-11

## What this is

A command-line prototype, in TypeScript, that manages seat reservations for one cinema screening room (§1). It is a learning-sized program: one room, one process, state held in memory for the life of the run.

**It is not** a web app, a multi-room or multi-showing system, or anything with persistence, users or payments. Nothing in `docs/spec.md` asks for those; check with mae before adding any of them.

## Who it's for

mae, as a prototype. The people using it are whoever runs it at a terminal.

## Stack

- Language: TypeScript (§1).
- Runtime: Node.js 22.18 or later, running the TypeScript directly; `tsc` only type-checks; tests use `node:test` (`decisions.md`).
- Dev dependencies only: `typescript` (7.x, for `tsc --noEmit`) and `@types/node` (22.x, matching the oldest supported Node). Settings in `tsconfig.json`; scripts in `package.json`.

## Commands

| Task | Command |
|---|---|
| Check the memory bank | `python3 scripts/check-memory.py` |
| Install | `npm install` |
| Run the command loop | `npm start` |
| Type-check | `npm run typecheck` |
| Test | `npm test` |

## Architecture

All state is one 8 x 10 2D array of `0` (available) and `1` (occupied), §2. No objects or classes represent the data (§2); no JSON metadata has been needed.

- `src/seats.ts`: the room and the functions in §4. Pure apart from `displayRoom`; reserve and cancel change the room in place and return a status message.
- `src/cli.ts`: `runCommand` turns one typed line into a status message (testable without a terminal); `startLoop` reads lines and prints results.
- `src/main.ts`: entry point.
- `test/fixtures.ts` holds the four §5 room states; `test/seats.test.ts` and `test/cli.test.ts` test them.

The file-by-file design, message formats and command list are in `docs/plan.md`.

## Where facts live

| Kind of fact | Where |
|---|---|
| Requirements: data model, display, functions, tests, code style | `docs/spec.md` |
| How the build is laid out: files, functions, messages, commands, tests | `docs/plan.md` |
| How open points in the spec were settled, and why | `memory-bank/decisions.md` |
| Current state, next steps, open questions | `memory-bank/status.md` |
| What each session did | `memory-bank/log.md` |
| mae's preferences, environment gotchas | `memory-bank/notes.md` |
| Rules for the memory bank itself | `.agents/prompts/memory-bank.md` |
