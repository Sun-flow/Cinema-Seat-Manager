# Log

> **Last updated**: 2026-11-11
> Session handoffs, newest first. One short entry per session: date, where it ran, what changed (link the PR or commit), and what was left open.

### 2026-11-11: click and drag group reservations (Claude Code, cloud)

- mae asked for click and drag selection of consecutive seats in one row, submitted to the reserve function. Added `reserveSeats()`, the `reserve <row> <a>-<b>` command and the page's drag selection with a Reserve bar (see `decisions.md`). 62 tests pass; drag checked with Playwright. Same branch and PR #2.
- Also published a browser-only demo of the page as a claude.ai artifact (not in the repo).

### 2026-11-11: web interface (Claude Code, cloud)

- mae asked for an HTML + Tailwind web interface with clickable seats, a dark theme and saving to reservations/[date].json. Added `src/server.ts`, `src/web.ts`, `web/index.html` and `test/server.test.ts` (56 tests pass, typecheck clean); checked the page with Playwright at desktop and phone widths. Branch claude/project-thread-i5uee8.
- Left open: mae's review, and the two open questions in `status.md`.

### 2026-11-11: program built (Claude Code, cloud)

- mae approved `docs/plan.md`. Built `src/seats.ts`, `src/cli.ts`, `src/main.ts` and the tests in `test/`, on PR #1 (branch claude/project-thread-nb962l). 42 tests pass; typecheck is clean; the loop was tried by hand with piped input.
- Small additions to the plan: a legend line under the display, the total seat count in the stats message, and an `ERROR:` message if a command throws unexpectedly.
- Left open: nothing; waiting on mae's review.

### 2026-11-10: open questions settled (Claude Code, cloud)

- mae answered numbering, seat values, pair search order, invalid input, interaction mode and agent tooling; each is in `decisions.md`. Removed the Copilot pointer, since Claude Code is the only agent for now.
- mae then chose Node.js tooling. Wrote the build plan in `docs/plan.md`; it waits for mae's approval before any code.

### 2026-11-10: memory bank set up (Claude Code, cloud)

- Copied `.agents/prompts/memory-bank.md` and `scripts/check-memory.py` unchanged from mae's recent projects (the same versions as in Prophecy-Rebuild and TrackFlow-Company-Overhaul).
- Wrote `docs/spec.md` from mae's requirements, and created the memory bank, `AGENTS.md`, `CLAUDE.md` and a GitHub Copilot pointer (removed later the same day).
- No code yet. Left open: the questions in `status.md`, starting with tooling and seat numbering.
