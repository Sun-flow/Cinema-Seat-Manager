# Cinema Seat Manager

A TypeScript command-line prototype for managing seat reservations in a cinema screening room of 8 rows by 10 columns. The requirements are in [docs/spec.md](docs/spec.md) and the design in [docs/plan.md](docs/plan.md).

## Run it

Needs Node.js 22.18 or later, which runs the TypeScript directly.

```
npm install
npm start
```

Then type commands at the `>` prompt:

| Command | Does |
|---|---|
| `show` | Shows the room: `X` occupied, `L` available. |
| `reserve <row> <col>` | Reserves a seat, e.g. `reserve 3 5`. Rows are 1-8, columns 1-10. |
| `cancel <row> <col>` | Cancels a reservation. |
| `stats` | Shows how many seats are occupied and available. |
| `pair` | Finds the first two adjacent available seats in a row. |
| `help` | Lists the commands. |
| `quit` | Exits. |

## Check it

```
npm run typecheck
npm test
```

AI coding agents start at [AGENTS.md](AGENTS.md).
