# Status

> **Last updated**: 2026-11-11

## Works

- The memory bank, `AGENTS.md`, `CLAUDE.md` and `scripts/check-memory.py` (2026-11-10).
- The requirements are written down in `docs/spec.md` (2026-11-10).
- The program, built to `docs/plan.md`: all six §4 functions, the command loop, and 42 tests covering the four §5 room states and invalid input (2026-11-11). `npm run typecheck` and `npm test` pass.
- The web interface: `npm run web`, clickable seats, every function, save/load of reservations/<date>.json; 56 tests pass (2026-11-11).
- mae settled tooling, numbering, seat values, pair search order, invalid input, interaction mode and agent tooling (2026-11-10); see `decisions.md`.

## In progress

- Web interface on branch claude/project-thread-i5uee8 (cloud), waiting for mae's review in a PR.

## Next

1. mae reviews the web interface PR.
2. Nothing else is planned. Ask mae before adding features beyond `docs/spec.md`.

## Open questions

- Should reservations/*.json be committed or git-ignored? Left tracked-but-uncommitted for now.
- `docs/spec.md` still describes a command-line prototype only; ask mae whether to add the web interface to it.

## Known problems

- None.
