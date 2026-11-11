/**
 * Tests for src/seats.ts against the four room states in docs/spec.md §5.
 * Run with `npm test`.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  COLS,
  ROWS,
  cancelReservation,
  countOccupancy,
  createRoom,
  findAdjacentPair,
  formatRoom,
  occupancyMessage,
  pairMessage,
  reserveSeat,
  reserveSeats,
  seatError,
} from "../src/seats.ts";
import { emptyRoom, fullRoom, nearlyFullRoom, partialRoom } from "./fixtures.ts";

describe("createRoom", () => {
  test("makes 8 rows of 10 available seats", () => {
    const room = createRoom();
    assert.equal(room.length, ROWS);
    for (const row of room) {
      assert.equal(row.length, COLS);
      assert.ok(row.every((seat) => seat === 0));
    }
    assert.deepEqual(room, emptyRoom());
  });

  test("rows are separate arrays", () => {
    const room = createRoom();
    room[0][0] = 1;
    assert.equal(room[1][0], 0);
  });
});

describe("seatError", () => {
  test("accepts the corners of the room", () => {
    assert.equal(seatError(1, 1), null);
    assert.equal(seatError(1, 10), null);
    assert.equal(seatError(8, 1), null);
    assert.equal(seatError(8, 10), null);
  });

  test("rejects rows and columns outside the room", () => {
    assert.equal(seatError(0, 5), "INVALID INPUT: Row must be a whole number from 1 to 8 (got 0).");
    assert.equal(seatError(9, 5), "INVALID INPUT: Row must be a whole number from 1 to 8 (got 9).");
    assert.equal(seatError(3, 0), "INVALID INPUT: Column must be a whole number from 1 to 10 (got 0).");
    assert.equal(seatError(3, 11), "INVALID INPUT: Column must be a whole number from 1 to 10 (got 11).");
    assert.equal(seatError(-1, 5), "INVALID INPUT: Row must be a whole number from 1 to 8 (got -1).");
  });

  test("rejects numbers that are not whole", () => {
    assert.match(seatError(2.5, 3) ?? "", /^INVALID INPUT: Row/);
    assert.match(seatError(2, Number.NaN) ?? "", /^INVALID INPUT: Column/);
  });
});

describe("formatRoom", () => {
  test("shows the screen, numbered columns and rows, and the legend", () => {
    const lines = formatRoom(emptyRoom()).split("\n");
    assert.equal(lines.length, 1 + 1 + ROWS + 1);
    assert.equal(lines[0].trim(), "SCREEN");
    assert.equal(lines[1], "      1  2  3  4  5  6  7  8  9 10");
    assert.equal(lines[2], " 1    L  L  L  L  L  L  L  L  L  L");
    assert.equal(lines[9], " 8    L  L  L  L  L  L  L  L  L  L");
    assert.equal(lines[10], "X = occupied, L = available");
  });

  test("partially filled room shows X for occupied seats", () => {
    const lines = formatRoom(partialRoom()).split("\n");
    assert.equal(lines[2], " 1    X  X  X  X  X  L  L  L  L  L");
    assert.equal(lines[4], " 3    X  L  X  L  X  L  X  L  X  L");
    assert.equal(lines[9], " 8    L  L  L  L  L  L  L  L  X  X");
  });

  test("nearly full room shows the scattered single seats", () => {
    const lines = formatRoom(nearlyFullRoom()).split("\n");
    assert.equal(lines[2], " 1    X  L  X  X  X  X  L  X  X  X");
    assert.equal(lines[7], " 6    L  X  X  X  L  X  X  X  X  X");
  });

  test("full room shows only X", () => {
    const seatLines = formatRoom(fullRoom()).split("\n").slice(2, 2 + ROWS);
    for (const line of seatLines) {
      assert.ok(!line.slice(4).includes("L"));
    }
  });
});

describe("countOccupancy", () => {
  test("empty room", () => {
    assert.deepEqual(countOccupancy(emptyRoom()), [0, 80]);
    assert.equal(occupancyMessage(emptyRoom()), "INFO: 0 seats occupied, 80 available (80 total).");
  });

  test("partially filled room", () => {
    assert.deepEqual(countOccupancy(partialRoom()), [16, 64]);
    assert.equal(occupancyMessage(partialRoom()), "INFO: 16 seats occupied, 64 available (80 total).");
  });

  test("nearly full room", () => {
    assert.deepEqual(countOccupancy(nearlyFullRoom()), [74, 6]);
  });

  test("full room", () => {
    assert.deepEqual(countOccupancy(fullRoom()), [80, 0]);
    assert.equal(occupancyMessage(fullRoom()), "INFO: 80 seats occupied, 0 available (80 total).");
  });
});

describe("findAdjacentPair", () => {
  test("empty room: the first two seats of row 1", () => {
    assert.deepEqual(findAdjacentPair(emptyRoom()), [
      [1, 1],
      [1, 2],
    ]);
    assert.equal(pairMessage(emptyRoom()), "INFO: First adjacent pair: row 1, columns 1 and 2.");
  });

  test("partially filled room: the first pair in row 1", () => {
    assert.deepEqual(findAdjacentPair(partialRoom()), [
      [1, 6],
      [1, 7],
    ]);
  });

  test("nearly full room with only single seats: no pair", () => {
    assert.equal(findAdjacentPair(nearlyFullRoom()), null);
    assert.equal(pairMessage(nearlyFullRoom()), "INFO: No two adjacent seats are available in any row.");
  });

  test("full room: no pair", () => {
    assert.equal(findAdjacentPair(fullRoom()), null);
    assert.equal(pairMessage(fullRoom()), "INFO: No two adjacent seats are available in any row.");
  });

  test("moves to the next row when a row has no pair", () => {
    const room = fullRoom();
    room[0][3] = 0; // row 1 has a single seat only
    room[2][4] = 0; // row 3, columns 5 and 6
    room[2][5] = 0;
    room[5][0] = 0; // a later pair is not returned
    room[5][1] = 0;
    assert.deepEqual(findAdjacentPair(room), [
      [3, 5],
      [3, 6],
    ]);
  });

  test("finds a pair at the right edge, columns 9 and 10", () => {
    const room = fullRoom();
    room[7][8] = 0;
    room[7][9] = 0;
    assert.deepEqual(findAdjacentPair(room), [
      [8, 9],
      [8, 10],
    ]);
  });

  test("does not pair seats across the end of a row", () => {
    const room = fullRoom();
    room[0][9] = 0; // row 1, column 10
    room[1][0] = 0; // row 2, column 1
    assert.equal(findAdjacentPair(room), null);
  });

  test("does not change the room", () => {
    const room = partialRoom();
    findAdjacentPair(room);
    assert.deepEqual(room, partialRoom());
  });
});

describe("reserveSeat", () => {
  test("empty room: reserves the seat", () => {
    const room = emptyRoom();
    assert.equal(reserveSeat(room, 3, 5), "SUCCESS: Seat row 3, column 5 reserved.");
    assert.equal(room[2][4], 1);
    assert.deepEqual(countOccupancy(room), [1, 79]);
  });

  test("partially filled room: reserves a free seat, refuses a taken one", () => {
    const room = partialRoom();
    assert.equal(reserveSeat(room, 2, 1), "SUCCESS: Seat row 2, column 1 reserved.");
    assert.equal(reserveSeat(room, 1, 1), "FAILED: Seat row 1, column 1 is already reserved.");
    assert.deepEqual(countOccupancy(room), [17, 63]);
  });

  test("nearly full room: reserves one of the last single seats", () => {
    const room = nearlyFullRoom();
    assert.equal(reserveSeat(room, 4, 10), "SUCCESS: Seat row 4, column 10 reserved.");
    assert.deepEqual(countOccupancy(room), [75, 5]);
  });

  test("full room: every reservation fails", () => {
    const room = fullRoom();
    assert.equal(reserveSeat(room, 1, 1), "FAILED: Seat row 1, column 1 is already reserved.");
    assert.equal(reserveSeat(room, 8, 10), "FAILED: Seat row 8, column 10 is already reserved.");
    assert.deepEqual(room, fullRoom());
  });

  test("works at every corner", () => {
    const room = emptyRoom();
    for (const [row, col] of [
      [1, 1],
      [1, 10],
      [8, 1],
      [8, 10],
    ]) {
      assert.equal(reserveSeat(room, row, col), `SUCCESS: Seat row ${row}, column ${col} reserved.`);
    }
    assert.deepEqual(countOccupancy(room), [4, 76]);
  });

  test("invalid seats are reported and the room is unchanged", () => {
    const room = emptyRoom();
    assert.equal(reserveSeat(room, 0, 1), "INVALID INPUT: Row must be a whole number from 1 to 8 (got 0).");
    assert.equal(reserveSeat(room, 1, 11), "INVALID INPUT: Column must be a whole number from 1 to 10 (got 11).");
    assert.match(reserveSeat(room, 1.5, 1), /^INVALID INPUT/);
    assert.deepEqual(room, emptyRoom());
  });
});

describe("cancelReservation", () => {
  test("empty room: nothing to cancel", () => {
    const room = emptyRoom();
    assert.equal(
      cancelReservation(room, 3, 5),
      "FAILED: Seat row 3, column 5 is not reserved, so there is nothing to cancel.",
    );
    assert.deepEqual(room, emptyRoom());
  });

  test("partially filled room: cancels a reserved seat", () => {
    const room = partialRoom();
    assert.equal(cancelReservation(room, 4, 4), "SUCCESS: Reservation for seat row 4, column 4 cancelled.");
    assert.equal(room[3][3], 0);
    assert.deepEqual(countOccupancy(room), [15, 65]);
  });

  test("nearly full room: cancelling creates a pair", () => {
    const room = nearlyFullRoom();
    assert.equal(cancelReservation(room, 1, 3), "SUCCESS: Reservation for seat row 1, column 3 cancelled.");
    assert.deepEqual(findAdjacentPair(room), [
      [1, 2],
      [1, 3],
    ]);
  });

  test("full room: cancels any seat", () => {
    const room = fullRoom();
    assert.equal(cancelReservation(room, 8, 10), "SUCCESS: Reservation for seat row 8, column 10 cancelled.");
    assert.deepEqual(countOccupancy(room), [79, 1]);
  });

  test("reserve then cancel returns the room to how it was", () => {
    const room = partialRoom();
    reserveSeat(room, 5, 5);
    cancelReservation(room, 5, 5);
    assert.deepEqual(room, partialRoom());
  });

  test("invalid seats are reported and the room is unchanged", () => {
    const room = fullRoom();
    assert.equal(cancelReservation(room, 9, 1), "INVALID INPUT: Row must be a whole number from 1 to 8 (got 9).");
    assert.equal(cancelReservation(room, 1, 0), "INVALID INPUT: Column must be a whole number from 1 to 10 (got 0).");
    assert.deepEqual(room, fullRoom());
  });
});

describe("reserveSeats", () => {
  test("reserves every seat in the range, in either order", () => {
    const room = emptyRoom();
    assert.equal(reserveSeats(room, 3, 4, 7), "SUCCESS: Seats row 3, columns 4 to 7 reserved (4 seats).");
    assert.deepEqual(room[2], [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]);
    assert.equal(reserveSeats(room, 5, 10, 9), "SUCCESS: Seats row 5, columns 9 to 10 reserved (2 seats).");
    assert.deepEqual(room[4], [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
  });

  test("a range of one seat is a normal reservation", () => {
    const room = emptyRoom();
    assert.equal(reserveSeats(room, 2, 6, 6), "SUCCESS: Seat row 2, column 6 reserved.");
  });

  test("changes nothing when any seat in the range is taken", () => {
    const room = partialRoom();
    const before = partialRoom();
    assert.equal(
      reserveSeats(room, 3, 1, 4),
      "FAILED: In row 3, columns 1, 3 are already reserved, so no seats were reserved.",
    );
    assert.equal(reserveSeats(room, 4, 1, 4), "FAILED: In row 4, column 4 is already reserved, so no seats were reserved.");
    assert.deepEqual(room, before);
  });

  test("fails on a full room and rejects seats outside the room", () => {
    const room = fullRoom();
    assert.equal(
      reserveSeats(room, 8, 1, 2),
      "FAILED: In row 8, columns 1, 2 are already reserved, so no seats were reserved.",
    );
    assert.equal(reserveSeats(emptyRoom(), 1, 9, 11), "INVALID INPUT: Column must be a whole number from 1 to 10 (got 11).");
    assert.equal(reserveSeats(emptyRoom(), 0, 1, 2), "INVALID INPUT: Row must be a whole number from 1 to 8 (got 0).");
  });
});
