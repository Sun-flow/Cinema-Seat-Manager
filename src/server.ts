/**
 * A small local web server for the seat manager. Run it with `npm run web` and
 * open http://localhost:3000.
 *
 * It serves the page in web/index.html and a JSON API that runs the same seat
 * functions as the command loop (src/seats.ts, through runCommand() in
 * src/cli.ts). The room is still one 2D array of numbers held in memory; it is
 * written to reservations/<date>.json only when someone presses Save, and
 * today's file is read back when the server starts.
 *
 * API (every response is JSON; see stateJson() for its shape):
 *   GET  /api/state     the current room, counts and first adjacent pair
 *   POST /api/command   body {"command": "reserve 3 5"}: runs one CLI command
 *   POST /api/new       starts a new, empty room (docs/spec.md §4.1)
 *   POST /api/save      writes the room to reservations/<today>.json
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runCommand } from "./cli.ts";
import { dateStamp, isRoom, saveFileText } from "./savefile.ts";

export { dateStamp, isRoom, saveFileText };
import {
  countOccupancy,
  createRoom,
  findAdjacentPair,
  occupancyMessage,
} from "./seats.ts";

/** The repository folder, worked out from this file's location. */
const REPO_DIR = fileURLToPath(new URL("..", import.meta.url));
/** Where saved rooms go unless a test chooses another folder. */
export const DEFAULT_RESERVATIONS_DIR = join(REPO_DIR, "reservations");
/** The page served at "/". */
const PAGE_PATH = join(REPO_DIR, "web", "index.html");
/** The largest request body accepted, in bytes. Commands are a few characters long. */
const MAX_BODY_BYTES = 1024;

/**
 * Reads a saved room for one day, if there is one.
 *
 * Purpose: let the server pick up where today's last save left off.
 * How it works: reads <dir>/<date>.json and checks its "room" with isRoom().
 * Inputs: dir, the reservations folder; date, the YYYY-MM-DD stamp.
 * Outputs: a promise of [room, message]. room is null when there is no file or
 *   it can't be used; message says what happened.
 * Example:
 *   const [room, message] = await loadRoom("reservations", "2026-11-11");
 */
export async function loadRoom(dir: string, date: string): Promise<[room: number[][] | null, message: string]> {
  const file = `reservations/${date}.json`;
  let text: string;
  try {
    text = await readFile(join(dir, `${date}.json`), "utf8");
  } catch {
    return [null, `INFO: No save for ${date} yet, so the room starts empty.`];
  }
  try {
    const saved: unknown = JSON.parse(text);
    const room = (saved as { room?: unknown } | null)?.room;
    if (isRoom(room)) {
      return [room, `INFO: Loaded the room saved in ${file}.`];
    }
  } catch {
    // Falls through to the message below.
  }
  return [null, `FAILED: ${file} is not a valid saved room, so the room starts empty.`];
}

/**
 * Builds the JSON reply that describes the room.
 *
 * Purpose: one reply shape for every API call, so the page can redraw from any of them.
 * How it works: adds the counts and the first adjacent pair to the room and the
 *   status message.
 * Inputs: room, the 2D seat array; message, the status message to show.
 * Outputs: {"message", "room", "occupied", "available", "pair"}, where pair is
 *   [[row, col], [row, col]] counted from 1, or null.
 * Example:
 *   stateJson(room, "INFO: Ready.");
 */
export function stateJson(room: number[][], message: string): string {
  const [occupied, available] = countOccupancy(room);
  return JSON.stringify({ message, room, occupied, available, pair: findAdjacentPair(room) });
}

/**
 * Reads a small request body.
 *
 * Purpose: get the JSON sent with POST /api/command.
 * How it works: collects the chunks and stops with an error if the body is
 *   larger than MAX_BODY_BYTES.
 * Inputs: request, the incoming HTTP request.
 * Outputs: a promise of the body as text.
 * Example:
 *   const text = await readBody(request);
 */
async function readBody(request: IncomingMessage): Promise<string> {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > MAX_BODY_BYTES) {
      throw new Error("request body too large");
    }
  }
  return body;
}

/**
 * Sends a reply.
 *
 * Purpose: keep the status code and headers in one place.
 * How it works: writes the headers and the body, then ends the response.
 * Inputs: response, the HTTP response; status, the HTTP status code; type, the
 *   content type; body, the text to send.
 * Outputs: nothing returned; the reply is sent.
 * Example:
 *   send(response, 200, "application/json", stateJson(room, "INFO: Ready."));
 */
function send(response: ServerResponse, status: number, type: string, body: string): void {
  response.writeHead(status, { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-store" });
  response.end(body);
}

/**
 * Creates the web server (without starting it).
 *
 * Purpose: serve the page and the API for one room.
 * How it works: keeps the room in memory, loads today's save when the first
 *   request arrives (the first GET /api/state reports how that went; later ones
 *   report the occupancy), and answers each route listed at the top of this file.
 *   Commands go through runCommand(), so the page gets exactly the CLI's checks
 *   and status messages. Bad requests get a 400 with an INVALID INPUT message.
 * Inputs: reservationsDir, the folder for save files (reservations/ by default);
 *   today, a function giving the date stamp (today's by default; tests replace it).
 * Outputs: a node:http Server. Call .listen(port) to start it.
 * Example:
 *   createSeatServer().listen(3000);
 */
export function createSeatServer(
  reservationsDir: string = DEFAULT_RESERVATIONS_DIR,
  today: () => string = () => dateStamp(),
): Server {
  let room = createRoom();
  let loading: Promise<string> | null = null;
  let loadReported = false;

  const ensureLoaded = (): Promise<string> => {
    loading ??= loadRoom(reservationsDir, today()).then(([saved, message]) => {
      if (saved !== null) room = saved;
      return message;
    });
    return loading;
  };

  return createServer(async (request, response) => {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    const method = request.method ?? "GET";
    try {
      const loadMessage = await ensureLoaded();

      if (method === "GET" && (path === "/" || path === "/index.html")) {
        send(response, 200, "text/html", await readFile(PAGE_PATH, "utf8"));
      } else if (method === "GET" && path === "/api/state") {
        // The first visit hears how the room was loaded; later visits get the counts.
        const message = loadReported ? occupancyMessage(room) : loadMessage;
        loadReported = true;
        send(response, 200, "application/json", stateJson(room, message));
      } else if (method === "POST" && path === "/api/command") {
        let command: unknown;
        try {
          command = (JSON.parse(await readBody(request)) as { command?: unknown } | null)?.command;
        } catch {
          command = undefined;
        }
        if (typeof command !== "string") {
          send(response, 400, "application/json", stateJson(room, 'INVALID INPUT: Send {"command": "..."}.'));
          return;
        }
        const [message] = runCommand(room, command);
        send(response, 200, "application/json", stateJson(room, message));
      } else if (method === "POST" && path === "/api/new") {
        room = createRoom();
        send(response, 200, "application/json", stateJson(room, "SUCCESS: Started a new, empty room."));
      } else if (method === "POST" && path === "/api/save") {
        const date = today();
        await mkdir(reservationsDir, { recursive: true });
        await writeFile(join(reservationsDir, `${date}.json`), saveFileText(room, date, new Date()));
        send(response, 200, "application/json", stateJson(room, `SUCCESS: Saved the room to reservations/${date}.json.`));
      } else {
        send(response, 404, "application/json", JSON.stringify({ message: `INVALID INPUT: No such page: ${method} ${path}.` }));
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      send(response, 500, "application/json", stateJson(room, `ERROR: Something went wrong: ${reason}`));
    }
  });
}
