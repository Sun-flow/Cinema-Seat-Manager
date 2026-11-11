# Decisions

> **Last updated**: 2026-11-11
> Decisions with lasting consequences, newest first. Each entry: date and title, decision, rationale, alternatives considered, status. The repo has no other decision log, so this is it.

### 2026-11-11: Clicks build a selection of any free seats

- **Decision**: clicking an available seat adds it to the selection (clicking it again removes it); seats don't have to be neighbours or in the same row. A drag adds its run to the selection. While anything is selected, clicking a reserved seat does nothing; with nothing selected it still arms cancel. Reserve sends one seat as `reserve r c`, an unbroken run in one row as `reserve r a-b` (so clicking seats in order behaves like a drag), and anything else as `reserve r c r c ...`, which goes to the new `reserveSeatList()`: all or nothing, each seat through `reserveSeat()`.
- **Rationale**: mae's request on 2026-11-11.
- **Alternatives**: none considered.
- **Status**: active, pending mae's review on PR #3.

### 2026-11-11: Click and drag reserves consecutive seats, all or nothing

- **Decision**: on the page, pressing on an available seat and dragging along its row selects consecutive available seats; the selection stops before the first reserved seat and ignores other rows. Every selection, a single click included, shows a bar with a Reserve button; nothing is reserved until it is pressed (mae, 2026-11-11: single clicks ask for confirmation like groups). The page sends `reserve <row> <a>-<b>`, which `runCommand` passes to the new `reserveSeats()` in `src/seats.ts`. That checks every seat first and then calls `reserveSeat()` for each, so either all are reserved or none.
- **Rationale**: mae asked to select several consecutive seats in one row by dragging and submit them to the reserve function. All or nothing avoids half a group booking if a seat was taken in the meantime. Routing through the CLI command keeps one code path and makes it testable.
- **Alternatives**: reserving on release without a confirm step (a sloppy drag would book seats; single clicks did this at first, until mae asked for confirmation there too); one request per seat from the page (partial bookings possible).
- **Status**: active, pending mae's review.

### 2026-11-11: Web interface served by a small local Node server

- **Decision**: `npm run web` starts a `node:http` server (`src/server.ts`, no new dependencies) that serves `web/index.html` and a JSON API. Seat changes go through the CLI's `runCommand`, so the page has no seat logic of its own. Tailwind is loaded in the browser from the jsDelivr CDN (`@tailwindcss/browser`, pinned). Save writes reservations/<YYYY-MM-DD>.json (`{date, savedAt, room}`); the server loads today's file at start. Clicking a free seat reserves it; a reserved seat needs two clicks to cancel.
- **Rationale**: mae asked for an HTML + Tailwind page with clickable seats that saves to reservations/[date].json. A static page can't write files, so a local server is needed; reusing `runCommand` keeps one implementation of the rules.
- **Alternatives**: a Tailwind CLI build step (an extra dependency and build); a static page that downloads the JSON instead of saving (doesn't write into the folder); one click to cancel (too easy to drop a booking by mistake).
- **Status**: active, pending mae's review.

### 2026-11-10: Node.js runs the TypeScript directly; `node:test` for tests

- **Decision**: Node.js 22.18 or later runs the TypeScript files directly through its built-in type stripping. `typescript` is the only dependency, used for `tsc --noEmit` type checks. Tests use the built-in `node:test` and `node:assert`.
- **Rationale**: one dependency and almost no configuration suits a small prototype. Type stripping can't handle enums or namespaces, which the spec doesn't need; it already rules out classes (§2).
- **Alternatives**: compiling with `tsc` to JavaScript first (an extra build step and output folder); `tsx` plus Vitest (two more dependencies). mae chose Node.
- **Status**: active.

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
