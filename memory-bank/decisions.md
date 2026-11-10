# Decisions

> **Last updated**: 2026-11-10
> Decisions with lasting consequences, newest first. Each entry: date and title, decision, rationale, alternatives considered, status. The repo has no other decision log, so this is it.

### 2026-11-10: Requirements live in `docs/spec.md`

- **Decision**: mae's requirements are written once, in `docs/spec.md`, with numbered sections that the memory bank cites as §N.
- **Rationale**: the memory bank prompt says the bank points to binding docs and never copies them. With no spec in the repo, the requirements needed a home outside the bank.
- **Alternatives**: keeping the requirements in `memory-bank/context.md` (rejected: it would make memory the source of truth); the root `README.md` (rejected: that is for people running the program).
- **Status**: active.

### 2026-11-10: Memory bank from mae's shared prompt

- **Decision**: use `.agents/prompts/memory-bank.md` and `scripts/check-memory.py`, copied unchanged from mae's recent projects.
- **Rationale**: the same prompt is in Prophecy-Rebuild, TrackFlow-Company-Overhaul and sxs-agent, so every project works the same way. The check script came from Prophecy-Rebuild and TrackFlow (identical there); the sxs-agent copy has project-specific exclusions.
- **Alternatives**: the older memory-bank-generator-prompt.md from html-tailwindcss-project (rejected: superseded by the shared prompt).
- **Status**: active.
