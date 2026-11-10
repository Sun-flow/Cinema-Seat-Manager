# Context

> **Last updated**: 2026-11-10

## What this is

A command-line prototype, in TypeScript, that manages seat reservations for one cinema screening room (§1). It is a learning-sized program: one room, one process, state held in memory for the life of the run.

**It is not** a web app, a multi-room or multi-showing system, or anything with persistence, users or payments. Nothing in `docs/spec.md` asks for those; check with mae before adding any of them.

## Who it's for

mae, as a prototype. The people using it are whoever runs it at a terminal.

## Stack

- Language: TypeScript (§1).
- Runtime: Node.js 22.18 or later, running the TypeScript directly; `tsc` only type-checks; tests use `node:test` (`decisions.md`).
- Not scaffolded yet: there is no package.json. The planned scripts are in `docs/plan.md` ("Tooling").

## Commands

| Task | Command |
|---|---|
| Check the memory bank | `python3 scripts/check-memory.py` |
| Install, run, type-check, test | Planned in `docs/plan.md` ("Tooling"); move them here once they exist. |

## Architecture

Planned, not built yet. All state is one 8 x 10 2D array of `0` (available) and `1` (occupied), §2. Six plain functions operate on it: initialize, display, reserve, cancel, occupancy and adjacent pair search, §4. No objects or classes represent the data (§2); if metadata is needed it is JSON (§2).

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
