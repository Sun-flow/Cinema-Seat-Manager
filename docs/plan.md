# Build Plan

> **Last updated**: 2026-11-10
> **Status**: proposed, waiting for mae's approval. Nothing here is built yet.
> Implements `docs/spec.md` (cited as §N) together with the decisions in `memory-bank/decisions.md`.

## 1. Tooling

Node.js 22.18 or later runs the TypeScript files directly (type stripping). `typescript` is the only dev dependency.

| Script | Command | What it does |
|---|---|---|
| `npm start` | `node src/main.ts` | Starts the interactive command loop. |
| `npm run typecheck` | `tsc --noEmit` | Checks types; produces no files. |
| `npm test` | `node --test test/*.test.ts` | Runs the tests with the built-in `node:test`. |

`tsconfig.json`: `strict`, `noEmit`, `module: nodenext`, `allowImportingTsExtensions`, `verbatimModuleSyntax`, and `erasableSyntaxOnly` (so the type checker rejects anything Node can't strip, such as enums).

## 2. Files

| File | Holds |
|---|---|
| `src/seats.ts` | The room and the six functions in §4. No input/output except `displayRoom`. |
| `src/cli.ts` | Parsing a typed line into a command, and the read-run-print loop. |
| `src/main.ts` | Entry point: creates the room and starts the loop. |
| `test/fixtures.ts` | The four room states from §5 as literal 2D arrays. |
| `test/seats.test.ts` | Tests for every function against every room state. |
| `test/cli.test.ts` | Tests for command parsing and invalid input. |

## 3. Data

- The room is `number[][]`, 8 rows of 10 numbers, `0` available and `1` occupied (§2). Constants `ROWS = 8` and `COLS = 10`.
- Functions change the room in place, as §4 describes ("changing its value from 0 to 1").
- Results that hold more than one value are arrays, not objects: occupancy is `[occupied, available]`, and a seat position is `[row, column]`.
- Users count from 1 (row 1 to 8, column 1 to 10). One helper converts to 0-based array indexes; nothing else does index arithmetic.
- No JSON metadata is needed so far. If some appears (for example a command list), it will be JSON as §2 asks.

## 4. Functions (`src/seats.ts`)

Each gets a comment block covering purpose, behaviour, inputs, outputs and an invocation example (§6).

| Function | Returns |
|---|---|
| `createRoom()` | A new 8 x 10 room of zeros. |
| `formatRoom(room)` | The display as a string (testable); `displayRoom(room)` prints it. |
| `reserveSeat(room, row, col)` | A status message. Sets the seat to 1 if it was 0. |
| `cancelReservation(room, row, col)` | A status message. Sets the seat to 0 if it was 1. |
| `countOccupancy(room)` | `[occupied, available]`. |
| `findAdjacentPair(room)` | `[[row, col], [row, col + 1]]` in user numbering, or `null` when there's no pair. Scans row 1 left to right, then row 2, and so on. |

Display (§3), with the screen marked so the orientation is clear:

```
           SCREEN
     1  2  3  4  5  6  7  8  9 10
 1   L  L  X  L  L  L  L  L  L  L
 2   L  L  L  L  L  L  L  L  L  L
 ...
 8   L  L  L  L  L  L  L  L  L  X
```

## 5. Status messages

Every operation prints one line that starts with its outcome, so results read like request statuses:

- `SUCCESS: Seat row 3, column 5 reserved.`
- `FAILED: Seat row 3, column 5 is already reserved.`
- `FAILED: Seat row 3, column 5 is not reserved, so there is nothing to cancel.`
- `INVALID INPUT: Row must be a whole number from 1 to 8 (got "9").`
- `INFO: 12 seats occupied, 68 available.`
- `INFO: First adjacent pair: row 2, columns 4 and 5.` / `INFO: No two adjacent seats are available in any row.`

Invalid input is anything that isn't a known command with the right arguments: unknown commands, missing or extra arguments, non-numbers, decimals, and numbers out of range. It is reported as `INVALID INPUT` and the loop continues. Reserving a taken seat or cancelling a free one is a `FAILED` operation, not invalid input.

## 6. Commands (`src/cli.ts`)

| Command | Does |
|---|---|
| `show` | Prints the room. |
| `reserve <row> <col>` | Reserves a seat. |
| `cancel <row> <col>` | Cancels a reservation. |
| `stats` | Prints occupancy and availability. |
| `pair` | Finds the first two adjacent available seats. |
| `help` | Lists the commands. |
| `quit` | Exits. Ctrl+D (end of input) exits too. |

Commands are case-insensitive and extra spaces are ignored. The loop shows the room and the help once at start.

## 7. Tests

Fixtures for the four §5 states: empty; partially filled; nearly full with only scattered single seats (no adjacent pair anywhere); full. For each state, the tests check `countOccupancy`, `findAdjacentPair`, `formatRoom`, a reserve and a cancel, and the exact status message of each. Separate tests cover every kind of invalid input from §5 above, and the edges of the room (row 1, row 8, column 1, column 10, a pair at columns 9 and 10).

## 8. Order of work

1. Scaffold: `package.json`, `tsconfig.json`, `.gitignore`; update the memory bank's commands.
2. `src/seats.ts` with its tests, one function at a time.
3. `src/cli.ts`, `src/main.ts` and their tests.
4. Run typecheck and tests, try the loop by hand, update the memory bank, and open a PR.
