# Notes

> **Last updated**: 2026-11-10
> Things learned the hard way. Add to this as soon as you learn something the next session would otherwise rediscover. Keep each note to a line or two, and remove notes that stop being true.

## Working with mae

- The spec is mae's and is binding. When it's ambiguous, ask rather than pick silently, and record the answer in `decisions.md`.
- Confirm a plan with mae before building anything. Answering a question or settling a decision is not a go-ahead to start building. (Carried over from mae's earlier projects.)
- mae works in more than one environment (Claude Code in the cloud, and GitHub Copilot in a Codespace on earlier projects). Nothing outside the repo carries over between them, so anything worth keeping goes in this folder or `docs/`.

## Environment and tools

- `scripts/check-memory.py` needs only Python 3. It fails on any backticked path in the bank or `AGENTS.md` that doesn't exist, so don't backtick paths for files that haven't been created yet.

## Conventions

- Nothing yet beyond `docs/spec.md`.
