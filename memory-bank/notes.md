# Notes

> **Last updated**: 2026-11-11
> Things learned the hard way. Add to this as soon as you learn something the next session would otherwise rediscover. Keep each note to a line or two, and remove notes that stop being true.

## Working with mae

- The spec is mae's and is binding. When it's ambiguous, ask rather than pick silently, and record the answer in `decisions.md`.
- Confirm a plan with mae before building anything. Answering a question or settling a decision is not a go-ahead to start building. (Carried over from mae's earlier projects.)
- Claude Code is the only agent on this project for now (2026-11-10), so only `CLAUDE.md` points to `AGENTS.md`. If mae brings in another tool, add its one-line pointer (see `.agents/prompts/memory-bank.md`, "Entry point").
- Nothing outside the repo carries over between sessions or environments, so anything worth keeping goes in this folder or `docs/`.

## Environment and tools

- `node src/main.ts` and `node --test` run TypeScript directly with no warning on Node 22.18+. Imports between files must use the .ts extension (`tsconfig.json` allows it); `erasableSyntaxOnly` makes `tsc` reject enums and other syntax Node can't strip.
- `scripts/check-memory.py` needs only Python 3. It fails on any backticked path in the bank or `AGENTS.md` that doesn't exist, so don't backtick paths for files that haven't been created yet.

- The cloud container can't reach cdn.jsdelivr.net (403 from the proxy). To screenshot the web page there, `npm i @tailwindcss/browser` in a scratch folder and have Playwright route the CDN URL to its dist/index.global.js.

- `stripTypeScriptTypes` from node:module is still marked experimental on Node 22, so the build and test scripts pass `--disable-warning=ExperimentalWarning`.

## Conventions

- Nothing yet beyond `docs/spec.md`.
