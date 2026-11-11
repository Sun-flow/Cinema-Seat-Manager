/**
 * The interactive command loop: reads a command, runs it, prints a status
 * message, and repeats until the user quits.
 */

import { createInterface } from "node:readline";
import {
  COLS,
  ROWS,
  cancelReservation,
  formatRoom,
  occupancyMessage,
  pairMessage,
  reserveSeat,
} from "./seats.ts";

/** The text printed by the "help" command and at start-up. */
export const HELP_TEXT = [
  "Commands:",
  "  show                 Show the screening room",
  `  reserve <row> <col>  Reserve a seat (row 1-${ROWS}, column 1-${COLS})`,
  "  cancel <row> <col>   Cancel a seat reservation",
  "  stats                Show how many seats are occupied and available",
  "  pair                 Find the first two adjacent available seats in a row",
  "  help                 Show this list",
  "  quit                 Exit the program",
].join("\n");

/**
 * Reads one row or column number typed by the user.
 *
 * Purpose: turn typed text into a seat number, rejecting anything that isn't one.
 * How it works: accepts only digits (so "3" but not "3.5", "-1", "+3" or "three"),
 *   then checks the number is between 1 and max.
 * Inputs: text, what the user typed; label, "Row" or "Column" for the message;
 *   max, the largest allowed number.
 * Outputs: the number when it is valid, otherwise an "INVALID INPUT: ..." message.
 *   Check which with typeof.
 * Example:
 *   parseSeatNumber("3", "Row", 8);    // 3
 *   parseSeatNumber("x", "Row", 8);    // "INVALID INPUT: Row must be a whole number from 1 to 8 (got \"x\")."
 */
export function parseSeatNumber(text: string, label: string, max: number): number | string {
  const invalid = `INVALID INPUT: ${label} must be a whole number from 1 to ${max} (got "${text}").`;
  if (!/^\d+$/.test(text)) {
    return invalid;
  }
  const value = Number(text);
  if (value < 1 || value > max) {
    return invalid;
  }
  return value;
}

/**
 * Runs one line typed by the user.
 *
 * Purpose: the heart of the loop, kept separate from reading and printing so it
 *   can be tested.
 * How it works: splits the line into words (case and extra spaces don't matter),
 *   picks the command by its first word, checks the number of arguments and
 *   their values, then calls the matching seat function. Anything it can't run
 *   is reported as INVALID INPUT. The room is changed in place by reserve and
 *   cancel.
 * Inputs: room, the 2D seat array; line, the text the user typed.
 * Outputs: [message, quit]: the text to print, and true when the user asked to quit.
 * Example:
 *   runCommand(room, "reserve 3 5");   // ["SUCCESS: Seat row 3, column 5 reserved.", false]
 */
export function runCommand(room: number[][], line: string): [message: string, quit: boolean] {
  const words = line.trim().split(/\s+/).filter((word) => word !== "");
  if (words.length === 0) {
    return ['INVALID INPUT: Please type a command. Type "help" to see them all.', false];
  }
  const command = words[0].toLowerCase();
  const args = words.slice(1);

  switch (command) {
    case "show":
    case "stats":
    case "pair":
    case "help":
    case "quit": {
      if (args.length > 0) {
        return [`INVALID INPUT: "${command}" takes no arguments (got "${args.join(" ")}").`, false];
      }
      if (command === "show") return [formatRoom(room), false];
      if (command === "stats") return [occupancyMessage(room), false];
      if (command === "pair") return [pairMessage(room), false];
      if (command === "help") return [HELP_TEXT, false];
      return ["Goodbye.", true];
    }
    case "reserve":
    case "cancel": {
      if (args.length !== 2) {
        return [
          `INVALID INPUT: "${command}" needs a row and a column, for example "${command} 3 5" (got ${args.length} argument${args.length === 1 ? "" : "s"}).`,
          false,
        ];
      }
      const row = parseSeatNumber(args[0], "Row", ROWS);
      if (typeof row === "string") return [row, false];
      const col = parseSeatNumber(args[1], "Column", COLS);
      if (typeof col === "string") return [col, false];
      const message = command === "reserve" ? reserveSeat(room, row, col) : cancelReservation(room, row, col);
      return [message, false];
    }
    default:
      return [`INVALID INPUT: Unknown command "${words[0]}". Type "help" to see them all.`, false];
  }
}

/**
 * Starts the interactive loop.
 *
 * Purpose: let a person manage the room from the terminal (decisions.md: commands
 *   from the user in a loop).
 * How it works: prints the room and the help, then for each line typed calls
 *   runCommand() and prints its message. An unexpected error is reported and the
 *   loop keeps going. It ends on "quit" or at the end of input (Ctrl+D, or the
 *   end of piped input).
 * Inputs: room, the 2D seat array; input and output streams (the terminal by default).
 * Outputs: a promise that resolves when the loop ends.
 * Example:
 *   await startLoop(createRoom());
 */
export async function startLoop(
  room: number[][],
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
): Promise<void> {
  const rl = createInterface({ input, output, terminal: false });
  const print = (text: string): void => {
    output.write(text + "\n");
  };

  print("Cinema Seat Manager");
  print(formatRoom(room));
  print(HELP_TEXT);
  output.write("> ");

  for await (const line of rl) {
    let message: string;
    let quit = false;
    try {
      [message, quit] = runCommand(room, line);
    } catch (error) {
      message = `ERROR: Something went wrong: ${error instanceof Error ? error.message : String(error)}`;
    }
    print(message);
    if (quit) {
      rl.close();
      return;
    }
    output.write("> ");
  }
  print("\nGoodbye.");
}
