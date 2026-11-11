/**
 * The save file format, shared by the local server (src/server.ts) and the
 * GitHub Pages build (scripts/build-pages.ts). No Node.js imports, so it also
 * runs in the browser.
 *
 * A save is JSON metadata around the room's 2D array (docs/spec.md §2):
 *   {"date": "YYYY-MM-DD", "savedAt": "<ISO time>", "room": [[0, 1, ...], ...]}
 */

import { AVAILABLE, COLS, OCCUPIED, ROWS } from "./seats.ts";

/**
 * Gives a date as YYYY-MM-DD in the server's local time zone.
 *
 * Purpose: name the save file after the day, as reservations/[date].json.
 * How it works: reads the local year, month and day and pads them with zeros.
 * Inputs: date, the moment to use (now by default).
 * Outputs: a string such as "2026-11-11".
 * Example:
 *   dateStamp(new Date(2026, 10, 11));   // "2026-11-11"
 */
export function dateStamp(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Checks that a value read from a file is a valid room.
 *
 * Purpose: never load a damaged or hand-edited file as the room.
 * How it works: the value must be an array of ROWS arrays, each holding COLS
 *   numbers that are 0 or 1.
 * Inputs: value, anything parsed from JSON.
 * Outputs: true when it is a valid room, otherwise false.
 * Example:
 *   isRoom(createRoom());   // true
 *   isRoom([[0, 1]]);       // false
 */
export function isRoom(value: unknown): value is number[][] {
  return (
    Array.isArray(value) &&
    value.length === ROWS &&
    value.every(
      (row) =>
        Array.isArray(row) && row.length === COLS && row.every((seat) => seat === AVAILABLE || seat === OCCUPIED),
    )
  );
}

/**
 * Builds the JSON text for a saved room.
 *
 * Purpose: the format of reservations/<date>.json. The seats stay a 2D array;
 *   the date and save time are JSON metadata around it (docs/spec.md §2).
 * How it works: puts the date, the time of saving and the room in one JSON
 *   document, with each row of the room on its own line so the file is easy to read.
 * Inputs: room, the 2D seat array; date, the YYYY-MM-DD stamp; savedAt, the
 *   moment of saving.
 * Outputs: the file contents as a string.
 * Example:
 *   saveFileText(room, "2026-11-11", new Date());
 */
export function saveFileText(room: number[][], date: string, savedAt: Date): string {
  const rows = room.map((row) => `    ${JSON.stringify(row)}`).join(",\n");
  return `{\n  "date": ${JSON.stringify(date)},\n  "savedAt": ${JSON.stringify(savedAt.toISOString())},\n  "room": [\n${rows}\n  ]\n}\n`;
}
