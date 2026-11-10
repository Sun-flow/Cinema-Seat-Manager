# AGENTS.md: Agent Entry Point

> **For AI coding agents.** Start here every session, whatever tool or environment you run in. `CLAUDE.md` points here; keep instructions in this file only.

## Project: Cinema Seat Manager

A TypeScript command-line prototype that manages seat reservations for one cinema screening room, held in an 8 x 10 2D array. The binding requirements are in `docs/spec.md`.

## Start of every session

Your memory doesn't carry over between sessions, so this repo keeps it for you in `memory-bank/`.

1. Open `memory-bank/README.md` and follow its start-of-session steps. They tell you what the project is, how to run it, where things stand and what the last session left open.
2. Read `docs/spec.md` before changing any code. It is binding: no objects or classes for the seat data, a 2D array only, and every function commented.

## End of every session

Before you finish or hand work back, update the memory bank as `memory-bank/README.md` describes: `status.md`, a new entry at the top of `log.md`, anything learned in `notes.md`, and any new decision in `decisions.md`. Then run `python3 scripts/check-memory.py` and commit the memory changes with the work. Write things down as you learn them; sessions can end without warning.

## Where things go

| Path | Purpose |
|---|---|
| `docs/spec.md` | The binding requirements: data model, display, functions, tests, code style. |
| `memory-bank/` | Session memory: orientation, status, handoff log, notes, decisions. |
| `scripts/check-memory.py` | Checks the memory bank and lists commits it hasn't caught up with. |
| `.agents/prompts/memory-bank.md` | The project-agnostic prompt that builds and maintains `memory-bank/`. |
