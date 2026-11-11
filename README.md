# Cinema Seat Manager

A TypeScript command-line and local web prototype for managing seat reservations in a cinema screening room of 8 rows by 10 columns. The requirements are in [docs/spec.md](docs/spec.md) and the design in [docs/plan.md](docs/plan.md).

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
| `reserve <row> <a>-<b>` | Reserves seats a to b in one row, e.g. `reserve 3 4-7`. If any of them is taken, none are reserved. |
| `cancel <row> <col>` | Cancels a reservation. |
| `stats` | Shows how many seats are occupied and available. |
| `pair` | Finds the first two adjacent available seats in a row. |
| `help` | Lists the commands. |
| `quit` | Exits. |

## Web interface

```
npm run web
```

Then open http://localhost:3000. It runs the same seat functions as the command line: click an available seat to reserve it, or press and drag along a row to select several neighbouring seats and press **Reserve**; click a reserved seat twice to cancel it, and use the buttons for the adjacent pair search, occupancy and the text view. **Save** writes the room to `reservations/<date>.json`; when the server starts it loads today's file if there is one. Set `PORT` to use another port. The page loads Tailwind CSS from a CDN, so the browser needs internet access.

## Check it

```
npm run typecheck
npm test
```

AI coding agents start at [AGENTS.md](AGENTS.md).
