/**
 * Tests for src/cli.ts: command parsing, invalid input and the loop itself.
 * Run with `npm test`.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { HELP_TEXT, parseSeatNumber, runCommand, startLoop } from "../src/cli.ts";
import { countOccupancy, formatRoom } from "../src/seats.ts";
import { emptyRoom, fullRoom, nearlyFullRoom, partialRoom } from "./fixtures.ts";

describe("parseSeatNumber", () => {
  test("accepts whole numbers in range", () => {
    assert.equal(parseSeatNumber("1", "Row", 8), 1);
    assert.equal(parseSeatNumber("8", "Row", 8), 8);
    assert.equal(parseSeatNumber("10", "Column", 10), 10);
  });

  test("rejects anything else as invalid input", () => {
    for (const text of ["0", "9", "-1", "+3", "3.5", "three", "3a", "", "1e1"]) {
      assert.equal(
        parseSeatNumber(text, "Row", 8),
        `INVALID INPUT: Row must be a whole number from 1 to 8 (got "${text}").`,
      );
    }
  });
});

describe("runCommand", () => {
  test("reserve and cancel change the room", () => {
    const room = emptyRoom();
    assert.deepEqual(runCommand(room, "reserve 3 5"), ["SUCCESS: Seat row 3, column 5 reserved.", false]);
    assert.equal(room[2][4], 1);
    assert.deepEqual(runCommand(room, "cancel 3 5"), [
      "SUCCESS: Reservation for seat row 3, column 5 cancelled.",
      false,
    ]);
    assert.equal(room[2][4], 0);
  });

  test("failed operations say why", () => {
    assert.deepEqual(runCommand(fullRoom(), "reserve 1 1"), ["FAILED: Seat row 1, column 1 is already reserved.", false]);
    assert.deepEqual(runCommand(emptyRoom(), "cancel 1 1"), [
      "FAILED: Seat row 1, column 1 is not reserved, so there is nothing to cancel.",
      false,
    ]);
  });

  test("show, stats, pair, help and quit", () => {
    const room = partialRoom();
    assert.deepEqual(runCommand(room, "show"), [formatRoom(room), false]);
    assert.deepEqual(runCommand(room, "stats"), ["INFO: 16 seats occupied, 64 available (80 total).", false]);
    assert.deepEqual(runCommand(room, "pair"), ["INFO: First adjacent pair: row 1, columns 6 and 7.", false]);
    assert.deepEqual(runCommand(nearlyFullRoom(), "pair"), [
      "INFO: No two adjacent seats are available in any row.",
      false,
    ]);
    assert.deepEqual(runCommand(room, "help"), [HELP_TEXT, false]);
    assert.deepEqual(runCommand(room, "quit"), ["Goodbye.", true]);
  });

  test("case and extra spaces don't matter", () => {
    const room = emptyRoom();
    assert.deepEqual(runCommand(room, "  RESERVE   2    4  "), ["SUCCESS: Seat row 2, column 4 reserved.", false]);
    assert.deepEqual(runCommand(room, "Stats"), ["INFO: 1 seat occupied, 79 available (80 total).", false]);
  });

  test("invalid input is reported as such and changes nothing", () => {
    const room = partialRoom();
    const cases: [string, string][] = [
      ["", 'INVALID INPUT: Please type a command. Type "help" to see them all.'],
      ["   ", 'INVALID INPUT: Please type a command. Type "help" to see them all.'],
      ["book 1 1", 'INVALID INPUT: Unknown command "book". Type "help" to see them all.'],
      ["reserve", 'INVALID INPUT: "reserve" needs a row and a column, for example "reserve 3 5" (got 0 arguments).'],
      ["reserve 1", 'INVALID INPUT: "reserve" needs a row and a column, for example "reserve 3 5" (got 1 argument).'],
      ["cancel 1 2 3", 'INVALID INPUT: "cancel" needs a row and a column, for example "cancel 3 5" (got 3 arguments).'],
      ["reserve 0 1", 'INVALID INPUT: Row must be a whole number from 1 to 8 (got "0").'],
      ["reserve 9 1", 'INVALID INPUT: Row must be a whole number from 1 to 8 (got "9").'],
      ["reserve 1 11", 'INVALID INPUT: Column must be a whole number from 1 to 10 (got "11").'],
      ["reserve a 1", 'INVALID INPUT: Row must be a whole number from 1 to 8 (got "a").'],
      ["cancel 1 2.5", 'INVALID INPUT: Column must be a whole number from 1 to 10 (got "2.5").'],
      ["show all", 'INVALID INPUT: "show" takes no arguments (got "all").'],
      ["quit now", 'INVALID INPUT: "quit" takes no arguments (got "now").'],
    ];
    for (const [line, message] of cases) {
      assert.deepEqual(runCommand(room, line), [message, false], `input: "${line}"`);
    }
    assert.deepEqual(room, partialRoom());
  });
});

/**
 * Runs the loop with the given lines as input and returns everything it printed.
 */
async function runLoop(room: number[][], lines: string[]): Promise<string> {
  const input = new PassThrough();
  const output = new PassThrough();
  let printed = "";
  output.on("data", (chunk: Buffer) => {
    printed += chunk.toString();
  });
  const done = startLoop(room, input, output);
  input.end(lines.map((line) => line + "\n").join(""));
  await done;
  return printed;
}

describe("startLoop", () => {
  test("runs commands in order until quit", async () => {
    const room = emptyRoom();
    const printed = await runLoop(room, ["reserve 1 1", "reserve 1 1", "nonsense", "stats", "quit", "reserve 2 2"]);
    assert.match(printed, /^Cinema Seat Manager\n/);
    assert.ok(printed.includes(HELP_TEXT));
    assert.ok(printed.includes("SUCCESS: Seat row 1, column 1 reserved."));
    assert.ok(printed.includes("FAILED: Seat row 1, column 1 is already reserved."));
    assert.ok(printed.includes('INVALID INPUT: Unknown command "nonsense".'));
    assert.ok(printed.includes("INFO: 1 seat occupied, 79 available (80 total)."));
    assert.ok(printed.includes("Goodbye."));
    assert.equal(room[1][1], 0, "nothing runs after quit");
  });

  test("ends cleanly at the end of input", async () => {
    const printed = await runLoop(emptyRoom(), ["pair"]);
    assert.ok(printed.includes("INFO: First adjacent pair: row 1, columns 1 and 2."));
    assert.match(printed, /Goodbye\.\n$/);
  });
});

describe("reserve with a column range", () => {
  test("reserves seats a to b in one row", () => {
    const room = emptyRoom();
    assert.deepEqual(runCommand(room, "reserve 2 3-5"), ["SUCCESS: Seats row 2, columns 3 to 5 reserved (3 seats).", false]);
    assert.deepEqual(room[1], [0, 0, 1, 1, 1, 0, 0, 0, 0, 0]);
  });

  test("reports bad ranges as invalid input", () => {
    const room = emptyRoom();
    assert.deepEqual(runCommand(room, "reserve 2 3-11"), [
      'INVALID INPUT: Column must be a whole number from 1 to 10 (got "11").',
      false,
    ]);
    assert.deepEqual(runCommand(room, "reserve 2 3-"), [
      'INVALID INPUT: Column must be a whole number from 1 to 10 (got "3-").',
      false,
    ]);
    assert.deepEqual(runCommand(room, "cancel 2 3-5"), [
      'INVALID INPUT: Column must be a whole number from 1 to 10 (got "3-5").',
      false,
    ]);
    assert.deepEqual(room, emptyRoom());
  });
});

describe("reserve with several seats", () => {
  test("reserves every row and column pair", () => {
    const room = emptyRoom();
    assert.deepEqual(runCommand(room, "reserve 2 3 5 7"), [
      "SUCCESS: Reserved 2 seats: row 2 column 3, row 5 column 7.",
      false,
    ]);
    assert.deepEqual(countOccupancy(room), [2, 78]);
  });

  test("reports a bad pair as invalid input and changes nothing", () => {
    const room = emptyRoom();
    assert.deepEqual(runCommand(room, "reserve 2 3 9 7"), ['INVALID INPUT: Row must be a whole number from 1 to 8 (got "9").', false]);
    assert.deepEqual(runCommand(room, "reserve 2 3 5"), [
      'INVALID INPUT: "reserve" needs a row and a column, for example "reserve 3 5" (got 3 arguments).',
      false,
    ]);
    assert.deepEqual(room, emptyRoom());
  });
});
