/**
 * Tests for src/server.ts: the JSON API behind the web page, and saving to
 * reservations/<date>.json. Each test uses its own temporary folder, so the
 * real reservations/ folder is never touched. Run with `npm test`.
 */

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSeatServer, dateStamp, isRoom, loadRoom, saveFileText } from "../src/server.ts";
import { createRoom } from "../src/seats.ts";
import { fullRoom, nearlyFullRoom, partialRoom } from "./fixtures.ts";

const DATE = "2026-11-11";

/**
 * Starts a server on a free port for one test.
 * Inputs: dir, the reservations folder to use.
 * Outputs: a promise of [server, base URL]. Close the server when done.
 * Example: const [server, base] = await start(dir);
 */
async function start(dir: string): Promise<[Server, string]> {
  const server = createSeatServer(dir, () => DATE);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return [server, `http://127.0.0.1:${port}`];
}

/**
 * Calls the API and parses the JSON reply.
 * Inputs: url; body, sent as JSON with a POST, or undefined for a GET;
 *   method, to force one (for example a POST with no body).
 * Outputs: a promise of [status code, reply].
 * Example: const [status, data] = await api(`${base}/api/state`);
 */
async function api(url: string, body?: unknown, method?: string): Promise<[number, any]> {
  const response = await fetch(url, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  return [response.status, await response.json()];
}

describe("helpers", () => {
  test("dateStamp gives YYYY-MM-DD with zeros", () => {
    assert.equal(dateStamp(new Date(2026, 0, 5)), "2026-01-05");
    assert.equal(dateStamp(new Date(2026, 10, 11)), "2026-11-11");
  });

  test("isRoom accepts only 8 x 10 arrays of 0 and 1", () => {
    assert.equal(isRoom(createRoom()), true);
    assert.equal(isRoom(fullRoom()), true);
    assert.equal(isRoom([[0, 1]]), false);
    assert.equal(isRoom(createRoom().map((row) => row.map(() => 2))), false);
    assert.equal(isRoom(createRoom().map((row) => row.map(String))), false);
    assert.equal(isRoom(null), false);
  });

  test("saveFileText writes the date, the time and the 2D array as JSON", () => {
    const room = partialRoom();
    const saved = JSON.parse(saveFileText(room, DATE, new Date("2026-11-11T06:00:00Z")));
    assert.deepEqual(saved, { date: DATE, savedAt: "2026-11-11T06:00:00.000Z", room });
  });
});

describe("loadRoom", () => {
  let dir: string;
  before(async () => {
    dir = await mkdtemp(join(tmpdir(), "seats-"));
  });
  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("says when there is no save yet", async () => {
    assert.deepEqual(await loadRoom(dir, "2000-01-01"), [null, "INFO: No save for 2000-01-01 yet, so the room starts empty."]);
  });

  test("loads a saved room", async () => {
    await writeFile(join(dir, `${DATE}.json`), saveFileText(nearlyFullRoom(), DATE, new Date()));
    assert.deepEqual(await loadRoom(dir, DATE), [nearlyFullRoom(), `INFO: Loaded the room saved in reservations/${DATE}.json.`]);
  });

  test("refuses a damaged file", async () => {
    await writeFile(join(dir, "2026-01-01.json"), "{not json");
    await writeFile(join(dir, "2026-01-02.json"), JSON.stringify({ room: [[1]] }));
    for (const date of ["2026-01-01", "2026-01-02"]) {
      assert.deepEqual(await loadRoom(dir, date), [
        null,
        `FAILED: reservations/${date}.json is not a valid saved room, so the room starts empty.`,
      ]);
    }
  });
});

describe("web server", () => {
  let dir: string;
  let server: Server;
  let base: string;
  before(async () => {
    dir = await mkdtemp(join(tmpdir(), "seats-"));
    [server, base] = await start(dir);
  });
  after(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
  });

  test("serves the page", async () => {
    const response = await fetch(`${base}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<title>Cinema Seat Manager<\/title>/);
  });

  test("starts with an empty room and says there was no save", async () => {
    const [status, data] = await api(`${base}/api/state`);
    assert.equal(status, 200);
    assert.deepEqual(data, {
      message: `INFO: No save for ${DATE} yet, so the room starts empty.`,
      room: createRoom(),
      occupied: 0,
      available: 80,
      pair: [[1, 1], [1, 2]],
    });
  });

  test("runs every command through the command loop's messages", async () => {
    let [, data] = await api(`${base}/api/command`, { command: "reserve 1 1" });
    assert.equal(data.message, "SUCCESS: Seat row 1, column 1 reserved.");
    assert.equal(data.room[0][0], 1);
    assert.equal(data.occupied, 1);
    assert.deepEqual(data.pair, [[1, 2], [1, 3]]);

    [, data] = await api(`${base}/api/command`, { command: "reserve 1 1" });
    assert.equal(data.message, "FAILED: Seat row 1, column 1 is already reserved.");

    [, data] = await api(`${base}/api/command`, { command: "stats" });
    assert.equal(data.message, "INFO: 1 seat occupied, 79 available (80 total).");

    [, data] = await api(`${base}/api/command`, { command: "pair" });
    assert.equal(data.message, "INFO: First adjacent pair: row 1, columns 2 and 3.");

    [, data] = await api(`${base}/api/command`, { command: "show" });
    assert.match(data.message, /SCREEN/);

    [, data] = await api(`${base}/api/command`, { command: "cancel 1 1" });
    assert.equal(data.message, "SUCCESS: Reservation for seat row 1, column 1 cancelled.");

    [, data] = await api(`${base}/api/command`, { command: "cancel 1 1" });
    assert.equal(data.message, "FAILED: Seat row 1, column 1 is not reserved, so there is nothing to cancel.");

    [, data] = await api(`${base}/api/command`, { command: "reserve 9 1" });
    assert.equal(data.message, 'INVALID INPUT: Row must be a whole number from 1 to 8 (got "9").');
  });

  test("later visits get the occupancy instead of the load message", async () => {
    const [, data] = await api(`${base}/api/state`);
    assert.equal(data.message, "INFO: 0 seats occupied, 80 available (80 total).");
  });

  test("rejects a request without a command", async () => {
    for (const body of ["{}", "not json", JSON.stringify({ command: 5 })]) {
      const [status, data] = await api(`${base}/api/command`, body);
      assert.equal(status, 400);
      assert.equal(data.message, 'INVALID INPUT: Send {"command": "..."}.');
    }
  });

  test("answers unknown routes with 404", async () => {
    const [status, data] = await api(`${base}/api/nothing`);
    assert.equal(status, 404);
    assert.equal(data.message, "INVALID INPUT: No such page: GET /api/nothing.");
  });

  test("saves to <date>.json, and a new server loads it back", async () => {
    await api(`${base}/api/command`, { command: "reserve 2 3" });
    const [, saved] = await api(`${base}/api/save`, undefined, "POST");
    assert.equal(saved.message, `SUCCESS: Saved the room to reservations/${DATE}.json.`);

    const file = JSON.parse(await readFile(join(dir, `${DATE}.json`), "utf8"));
    assert.equal(file.date, DATE);
    assert.equal(file.room[1][2], 1);

    const [second, secondBase] = await start(dir);
    try {
      const [, data] = await api(`${secondBase}/api/state`);
      assert.equal(data.message, `INFO: Loaded the room saved in reservations/${DATE}.json.`);
      assert.deepEqual(data.room, file.room);
    } finally {
      second.close();
    }
  });

  test("new room clears every seat", async () => {
    const [, data] = await api(`${base}/api/new`, undefined, "POST");
    assert.equal(data.message, "SUCCESS: Started a new, empty room.");
    assert.deepEqual(data.room, createRoom());
  });
});
