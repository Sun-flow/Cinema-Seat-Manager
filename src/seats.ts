/**
 * Seat functions for one cinema screening room.
 *
 * The room is a 2D array of numbers: ROWS arrays, each holding COLS numbers.
 * A 0 is an available seat and a 1 is an occupied seat. No objects or classes
 * represent the data (docs/spec.md §2).
 *
 * People count rows and columns from 1, so every function here takes and returns
 * 1-based row and column numbers. Only toIndex() converts them to 0-based array
 * indexes.
 */

/** Number of rows in the screening room. */
export const ROWS = 8;
/** Number of seats in each row. */
export const COLS = 10;
/** Value of an available seat in the room array. */
export const AVAILABLE = 0;
/** Value of an occupied seat in the room array. */
export const OCCUPIED = 1;

/** A seat position as [row, column], both counted from 1. */
export type Seat = [row: number, col: number];

/**
 * Creates an empty screening room.
 *
 * Purpose: start a new room where every seat is available.
 * How it works: builds ROWS separate arrays, each filled with COLS zeros, so
 *   changing one row never changes another.
 * Inputs: none.
 * Outputs: a new ROWS x COLS 2D array of 0s.
 * Example:
 *   const room = createRoom();   // room[0][0] === 0
 */
export function createRoom(): number[][] {
  const room: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    room.push(new Array<number>(COLS).fill(AVAILABLE));
  }
  return room;
}

/**
 * Checks that a row and column name a seat in the room.
 *
 * Purpose: one place that decides whether a seat position is valid, so every
 *   operation rejects bad positions the same way.
 * How it works: each number must be a whole number between 1 and ROWS (for the
 *   row) or 1 and COLS (for the column).
 * Inputs: row and col, counted from 1.
 * Outputs: null when the seat is valid, otherwise an "INVALID INPUT: ..." message
 *   that says what is wrong.
 * Example:
 *   seatError(3, 5);    // null
 *   seatError(9, 5);    // "INVALID INPUT: Row must be a whole number from 1 to 8 (got 9)."
 */
export function seatError(row: number, col: number): string | null {
  if (!Number.isInteger(row) || row < 1 || row > ROWS) {
    return `INVALID INPUT: Row must be a whole number from 1 to ${ROWS} (got ${row}).`;
  }
  if (!Number.isInteger(col) || col < 1 || col > COLS) {
    return `INVALID INPUT: Column must be a whole number from 1 to ${COLS} (got ${col}).`;
  }
  return null;
}

/**
 * Converts a 1-based row and column into 0-based array indexes.
 *
 * Purpose: keep the only piece of index arithmetic in one place.
 * How it works: subtracts 1 from each number.
 * Inputs: row and col, counted from 1. Check them with seatError() first.
 * Outputs: [rowIndex, colIndex], counted from 0.
 * Example:
 *   const [r, c] = toIndex(1, 1);   // r === 0, c === 0
 */
function toIndex(row: number, col: number): [rowIndex: number, colIndex: number] {
  return [row - 1, col - 1];
}

/**
 * Builds the text picture of the room.
 *
 * Purpose: show the current state of the screening room (docs/spec.md §3) in a
 *   form that can be printed or checked in tests.
 * How it works: writes a SCREEN label, a header of column numbers, then one line
 *   per row that starts with the row number and shows X for an occupied seat and
 *   L for an available one, and ends with a legend.
 * Inputs: room, the 2D seat array.
 * Outputs: the picture as one string with a line break between lines.
 * Example:
 *   console.log(formatRoom(createRoom()));
 */
export function formatRoom(room: number[][]): string {
  const rowLabelWidth = 4; // e.g. " 1  "
  const cellWidth = 3; // e.g. "  L"
  const width = rowLabelWidth + COLS * cellWidth;
  const title = "SCREEN";
  const lines: string[] = [];

  lines.push(" ".repeat(Math.floor((width - title.length) / 2) + 1) + title);

  let header = " ".repeat(rowLabelWidth);
  for (let c = 1; c <= COLS; c++) {
    header += String(c).padStart(cellWidth);
  }
  lines.push(header);

  for (let r = 0; r < room.length; r++) {
    let line = String(r + 1).padStart(2) + "  ";
    for (let c = 0; c < room[r].length; c++) {
      line += (room[r][c] === OCCUPIED ? "X" : "L").padStart(cellWidth);
    }
    lines.push(line);
  }

  lines.push("X = occupied, L = available");
  return lines.join("\n");
}

/**
 * Prints the room to the console.
 *
 * Purpose: the display function of docs/spec.md §3 and §4.2.
 * How it works: prints the text from formatRoom().
 * Inputs: room, the 2D seat array.
 * Outputs: nothing returned; the picture is printed.
 * Example:
 *   displayRoom(room);
 */
export function displayRoom(room: number[][]): void {
  console.log(formatRoom(room));
}

/**
 * Reserves one seat.
 *
 * Purpose: book a seat for a customer (docs/spec.md §4.3).
 * How it works: checks the position, then changes the seat from 0 to 1 if it is
 *   available. An occupied seat is left as it is. The room is changed in place.
 * Inputs: room, the 2D seat array; row and col, counted from 1.
 * Outputs: a status message that starts with SUCCESS, FAILED (seat already
 *   reserved) or INVALID INPUT (no such seat).
 * Example:
 *   reserveSeat(room, 3, 5);   // "SUCCESS: Seat row 3, column 5 reserved."
 */
export function reserveSeat(room: number[][], row: number, col: number): string {
  const error = seatError(row, col);
  if (error !== null) {
    return error;
  }
  const [r, c] = toIndex(row, col);
  if (room[r][c] === OCCUPIED) {
    return `FAILED: Seat row ${row}, column ${col} is already reserved.`;
  }
  room[r][c] = OCCUPIED;
  return `SUCCESS: Seat row ${row}, column ${col} reserved.`;
}

/**
 * Reserves several consecutive seats in one row, all or nothing.
 *
 * Purpose: book a group of neighbouring seats in one go (the web page's click
 *   and drag selection, or "reserve 3 4-7" in the command loop).
 * How it works: checks both ends of the range, then checks that every seat
 *   from fromCol to toCol is available. If any is taken, nothing changes. If
 *   all are free, it calls reserveSeat() for each one, so every seat goes
 *   through the same reserve function. fromCol and toCol can be given in
 *   either order. The room is changed in place.
 * Inputs: room, the 2D seat array; row, counted from 1; fromCol and toCol,
 *   the first and last column of the range, counted from 1.
 * Outputs: a status message that starts with SUCCESS, FAILED (one or more
 *   seats already reserved; it names them) or INVALID INPUT (no such seat).
 * Example:
 *   reserveSeats(room, 3, 4, 7);   // "SUCCESS: Seats row 3, columns 4 to 7 reserved (4 seats)."
 */
export function reserveSeats(room: number[][], row: number, fromCol: number, toCol: number): string {
  const error = seatError(row, fromCol) ?? seatError(row, toCol);
  if (error !== null) {
    return error;
  }
  const first = Math.min(fromCol, toCol);
  const last = Math.max(fromCol, toCol);
  if (first === last) {
    return reserveSeat(room, row, first);
  }

  const taken: number[] = [];
  for (let col = first; col <= last; col++) {
    const [r, c] = toIndex(row, col);
    if (room[r][c] === OCCUPIED) {
      taken.push(col);
    }
  }
  if (taken.length > 0) {
    const which = taken.length === 1 ? `column ${taken[0]} is` : `columns ${taken.join(", ")} are`;
    return `FAILED: In row ${row}, ${which} already reserved, so no seats were reserved.`;
  }

  for (let col = first; col <= last; col++) {
    reserveSeat(room, row, col);
  }
  return `SUCCESS: Seats row ${row}, columns ${first} to ${last} reserved (${last - first + 1} seats).`;
}

/**
 * Cancels the reservation of one seat.
 *
 * Purpose: free a seat that was booked (docs/spec.md §4.4).
 * How it works: checks the position, then changes the seat from 1 to 0 if it is
 *   reserved. An available seat is left as it is. The room is changed in place.
 * Inputs: room, the 2D seat array; row and col, counted from 1.
 * Outputs: a status message that starts with SUCCESS, FAILED (seat was not
 *   reserved) or INVALID INPUT (no such seat).
 * Example:
 *   cancelReservation(room, 3, 5);   // "SUCCESS: Reservation for seat row 3, column 5 cancelled."
 */
export function cancelReservation(room: number[][], row: number, col: number): string {
  const error = seatError(row, col);
  if (error !== null) {
    return error;
  }
  const [r, c] = toIndex(row, col);
  if (room[r][c] === AVAILABLE) {
    return `FAILED: Seat row ${row}, column ${col} is not reserved, so there is nothing to cancel.`;
  }
  room[r][c] = AVAILABLE;
  return `SUCCESS: Reservation for seat row ${row}, column ${col} cancelled.`;
}

/**
 * Counts occupied and available seats.
 *
 * Purpose: report how full the room is (docs/spec.md §4.5).
 * How it works: looks at every seat and adds it to one of the two totals.
 * Inputs: room, the 2D seat array.
 * Outputs: [occupied, available], two numbers that add up to ROWS x COLS.
 * Example:
 *   const [occupied, available] = countOccupancy(room);
 */
export function countOccupancy(room: number[][]): [occupied: number, available: number] {
  let occupied = 0;
  let available = 0;
  for (const row of room) {
    for (const seat of row) {
      if (seat === OCCUPIED) {
        occupied++;
      } else {
        available++;
      }
    }
  }
  return [occupied, available];
}

/**
 * Describes the occupancy as a status message.
 *
 * Purpose: the message shown for the "stats" command.
 * How it works: calls countOccupancy() and puts the numbers in a sentence.
 * Inputs: room, the 2D seat array.
 * Outputs: a message such as "INFO: 12 seats occupied, 68 available (80 total)."
 * Example:
 *   console.log(occupancyMessage(room));
 */
export function occupancyMessage(room: number[][]): string {
  const [occupied, available] = countOccupancy(room);
  const seats = occupied === 1 ? "seat" : "seats";
  return `INFO: ${occupied} ${seats} occupied, ${available} available (${occupied + available} total).`;
}

/**
 * Finds the first two adjacent available seats in the same row.
 *
 * Purpose: help seat two people together (docs/spec.md §4.6).
 * How it works: starts at row 1 and looks left to right for an available seat
 *   whose right-hand neighbour is also available. If the row has no such pair it
 *   moves on to the next row. The first pair found is returned.
 * Inputs: room, the 2D seat array.
 * Outputs: [[row, col], [row, col + 1]] counted from 1, or null when no row has
 *   two adjacent available seats.
 * Example:
 *   findAdjacentPair(createRoom());   // [[1, 1], [1, 2]]
 */
export function findAdjacentPair(room: number[][]): [Seat, Seat] | null {
  for (let r = 0; r < room.length; r++) {
    for (let c = 0; c + 1 < room[r].length; c++) {
      if (room[r][c] === AVAILABLE && room[r][c + 1] === AVAILABLE) {
        return [
          [r + 1, c + 1],
          [r + 1, c + 2],
        ];
      }
    }
  }
  return null;
}

/**
 * Describes the adjacent pair search as a status message.
 *
 * Purpose: the message shown for the "pair" command.
 * How it works: calls findAdjacentPair() and says where the pair is, or clearly
 *   says that there is none.
 * Inputs: room, the 2D seat array.
 * Outputs: a message starting with INFO.
 * Example:
 *   pairMessage(createRoom());   // "INFO: First adjacent pair: row 1, columns 1 and 2."
 */
export function pairMessage(room: number[][]): string {
  const pair = findAdjacentPair(room);
  if (pair === null) {
    return "INFO: No two adjacent seats are available in any row.";
  }
  const [[row, firstCol], [, secondCol]] = pair;
  return `INFO: First adjacent pair: row ${row}, columns ${firstCol} and ${secondCol}.`;
}
