# Context

> **Last updated**: 2026-11-11

## What this is

A command-line prototype, in TypeScript, that manages seat reservations for one cinema screening room (§1). It is a learning-sized program: one room, one process, state held in memory for the life of the run. mae added a local web page for it on 2026-11-11 (`decisions.md`), which can save the room to a dated JSON file.

It is also published as a static page on GitHub Pages (2026-11-11), where saves stay in each visitor's browser.

**It is not** a multi-user web app, a multi-room or multi-showing system, or anything with users or payments. Check with mae before adding any of them.

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
| Run the web interface | `npm run web`, then open http://localhost:3000 |
| Build the GitHub Pages copy | `npm run build:pages` (writes dist/index.html; the workflow does this on push to main) |
| Type-check | `npm run typecheck` |
| Test | `npm test` |

## Architecture

All state is one 8 x 10 2D array of `0` (available) and `1` (occupied), §2. No objects or classes represent the data (§2). The only JSON metadata is the save file: `{date, savedAt, room}`, with the room as the 2D array.

- `src/seats.ts`: the room and the functions in §4, plus `reserveSeats()` for a range in one row and `reserveSeatList()` for any list of seats (both all or nothing). Pure apart from `displayRoom`; reserve and cancel change the room in place and return a status message.
- `src/cli.ts`: `runCommand` turns one typed line into a status message (testable without a terminal); `startLoop` reads lines and prints results.
- `src/main.ts`: entry point.
- `src/server.ts`: local `node:http` server for the web page. Its JSON API sends commands through `runCommand`, so the page reuses the CLI's checks and messages; it also handles new room and save/load of reservations/<date>.json. `src/web.ts` starts it.
- `web/index.html`: the page (HTML, Tailwind from a CDN, plain JS). It keeps no seat logic; it redraws from the server's replies.
- `src/savefile.ts`: the save file format (`dateStamp`, `isRoom`, `saveFileText`), with no Node imports so the browser can run it too.
- GitHub Pages: `scripts/build-pages.ts` inlines `src/seats.ts`, `src/savefile.ts` and `runCommand` (types stripped) plus `web/pages-backend.js`, a browser stand-in for the server's API, into a copy of the page. `.github/workflows/pages.yml` tests, builds and deploys it on push to main.
- `test/fixtures.ts` holds the four §5 room states; `test/seats.test.ts`, `test/cli.test.ts` and `test/server.test.ts` test them.

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
