# Status

> **Last updated**: 2026-11-11

## Works

- The memory bank, `AGENTS.md`, `CLAUDE.md` and `scripts/check-memory.py` (2026-11-10).
- The requirements are written down in `docs/spec.md` (2026-11-10).
- The program, built to `docs/plan.md`: all six §4 functions, the command loop, and 42 tests covering the four §5 room states and invalid input (2026-11-11). `npm run typecheck` and `npm test` pass.
- The web interface: `npm run web`, clickable seats, every function, save/load of reservations/<date>.json; click and drag reserves consecutive seats in a row (2026-11-11). 62 tests pass.
- Merged in PR #3: single clicks confirm before reserving, and clicks select any free seats, reserved all or nothing. 68 tests pass.
- mae settled tooling, numbering, seat values, pair search order, invalid input, interaction mode and agent tooling (2026-11-10); see `decisions.md`.

## In progress

- GitHub Pages build and deploy workflow, on branch claude/project-thread-i5uee8 (cloud), in a PR for mae's review. The first deploy happens when it merges.

## Next

1. mae reviews the GitHub Pages PR, then checks the first deploy in the Actions tab.
2. Nothing else is planned. Ask mae before adding features beyond `docs/spec.md`.

## Open questions

- Should reservations/*.json be committed or git-ignored? Left tracked-but-uncommitted for now.
- `docs/spec.md` still describes a command-line prototype only; ask mae whether to add the web interface to it.

## Known problems

- None.
