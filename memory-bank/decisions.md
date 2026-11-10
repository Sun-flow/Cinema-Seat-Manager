# Decisions

> **Last updated**: 2026-11-10
> Decisions with lasting consequences, newest first. Each entry: date and title, decision, rationale, alternatives considered, status. The repo has no other decision log, so this is it.

### 2026-11-10: Claude Code is the only agent tool for now

- **Decision**: only `CLAUDE.md` points to `AGENTS.md`; the GitHub Copilot pointer added during setup was removed.
- **Rationale**: mae said Claude is in charge for now. One entry point keeps instructions from drifting.
- **Alternatives**: keeping the Copilot pointer because mae used Copilot on earlier projects (rejected by mae's answer).
- **Status**: active. Revisit if mae brings in another tool.

### 2026-11-10: The program reads commands from the user in a loop

- **Decision**: the CLI runs an interactive loop: it reads a command, runs it, prints a status message, and repeats until the user quits.
- **Rationale**: mae's choice. It lets someone try every operation in §4 in one session.
- **Alternatives**: a fixed demonstration script (rejected by mae). The §5 room states are still covered by the automated tests.
- **Status**: active. The command names and syntax are still to be planned with mae.

### 2026-11-10: All invalid input is reported as invalid, with proper error handling

- **Decision**: any input that isn't a valid command or seat (non-numeric, out of range, wrong number of arguments, unknown command) is reported to the user as invalid input, and the program keeps running. Reserving a taken seat or cancelling a free one is a failed operation with its own message (§4.3, §4.4), not a crash.
- **Rationale**: mae's choice: "all invalid input should be referred as such and have proper error handling".
- **Alternatives**: none considered.
- **Status**: active.

### 2026-11-10: Pair search scans row by row, left to right

- **Decision**: §4.6 searches row 1 first, left to right, for two adjacent available seats; the first pair found is returned. If a row has none, move to the next row. If no row has one, say so clearly.
- **Rationale**: mae's choice; it defines "the first one" in §4.6.
- **Alternatives**: none considered.
- **Status**: active.

### 2026-11-10: Seat values are numbers

- **Decision**: the matrix holds the numbers `0` (available) and `1` (occupied), not strings.
- **Rationale**: mae: "numbers, definitely". §2 writes them in quotes, which left it open.
- **Alternatives**: string values (rejected).
- **Status**: active.

### 2026-11-10: People count rows and columns from 1

- **Decision**: rows are numbered 1 to 8 and columns 1 to 10 everywhere the user sees or types them, including the display (§3). The code converts to 0-based array indexes internally, in one place.
- **Rationale**: mae: human-readable entries; there is no row or column zero from the user's point of view.
- **Alternatives**: 0-based numbering matching the array (rejected).
- **Status**: active.

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
