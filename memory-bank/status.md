# Status

> **Last updated**: 2026-11-10

## Works

- The memory bank, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` and `scripts/check-memory.py` (2026-11-10).
- The requirements are written down in `docs/spec.md` (2026-11-10).

## In progress

- Nothing.

## Next

1. Settle the open questions below with mae, and record each answer in `decisions.md`.
2. Agree a plan with mae, then scaffold the TypeScript project and add its commands to `context.md`.
3. Build the six functions in §4, each commented as §6 asks.
4. Write the tests for the four room states in §5.

## Open questions

All dated 2026-11-10. Each needs mae's answer; record it in `decisions.md`.

- **Tooling**: which runtime and test runner? A suggestion to put to mae: Node.js with `tsc` for the build and the built-in `node:test` runner, so there are no extra dependencies.
- **Numbering**: do people enter rows and columns counting from 1 (as a cinema would) or from 0 (as the array does)? The display (§3) should use the same numbering.
- **Seat values**: §2 writes the values as '1' and '0'. Numbers (`1`/`0`) or strings (`"1"`/`"0"`)? Numbers look intended.
- **"First" pair** (§4.6): is "first" scanning rows top to bottom, then columns left to right? And should the result be the two seats' row and column pairs?
- **Invalid input** (§4.3, §4.4): a failure message covers out-of-range and already-taken seats. Should non-numeric input be rejected the same way?
- **Interaction**: should the program run a fixed demonstration of the operations, read commands from the user in a loop, or both?
- **Agent tools**: mae has used Claude Code in the cloud and GitHub Copilot in a Codespace on earlier projects, so both have pointers. Confirm, or name others (Cursor, Cline).

## Known problems

- None.
