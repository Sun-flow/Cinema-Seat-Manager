/**
 * Tests for scripts/build-pages.ts: the GitHub Pages copy of the web page.
 * Run with `npm test`.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { buildPage, toScript, writePages } from "../scripts/build-pages.ts";

/**
 * Pulls the inlined seat code out of a built page.
 * Inputs: html, the built page. Outputs: the text of the first plain <script>.
 * Example: seatScript(await buildPage());
 */
function seatScript(html: string): string {
  const match = /<script>\n([\s\S]*?)\n<\/script>/.exec(html);
  assert.ok(match, "the page has an inlined <script>");
  return match[1];
}

describe("toScript", () => {
  test("strips types, imports and exports", () => {
    const script = toScript('import { ROWS } from "./seats.ts";\nexport function double(n: number): number {\n  return n * 2;\n}\n');
    assert.doesNotMatch(script, /import|export|: number/);
    assert.equal(runInNewContext(`${script}; double(4)`), 8);
  });
});

describe("buildPage", () => {
  test("inlines the real seat code, which runs the same commands as the CLI", async () => {
    const script = seatScript(await buildPage());
    // Run only the seat code; the browser stand-in at the end needs a window.
    const seatCode = script.slice(0, script.indexOf("// Stand-in for src/server.ts"));
    const results = runInNewContext(`${seatCode};
      const room = createRoom();
      JSON.stringify([
        runCommand(room, "reserve 3 4-7")[0],
        runCommand(room, "reserve 1 1 8 10")[0],
        runCommand(room, "stats")[0],
        isRoom(room),
        JSON.parse(saveFileText(room, "2026-11-11", new Date(0))).room[2][3],
      ])`);
    assert.deepEqual(JSON.parse(results), [
      "SUCCESS: Seats row 3, columns 4 to 7 reserved (4 seats).",
      "SUCCESS: Reserved 2 seats: row 1 column 1, row 8 column 10.",
      "INFO: 6 seats occupied, 74 available (80 total).",
      true,
      1,
    ]);
  });

  test("includes the browser stand-in and rewords the server lines", async () => {
    const html = await buildPage();
    assert.match(html, /Stand-in for src\/server\.ts on GitHub Pages/);
    assert.match(html, /Save keeps the room in this browser and downloads/);
    assert.doesNotMatch(html, /Is `npm run web` still running/);
    assert.doesNotMatch(html, /startLoop|createInterface|node:/);
  });
});

describe("writePages", () => {
  test("writes index.html and .nojekyll", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pages-"));
    try {
      const path = await writePages(dir);
      assert.equal(path, join(dir, "index.html"));
      assert.equal(await readFile(path, "utf8"), await buildPage());
      assert.equal(await readFile(join(dir, ".nojekyll"), "utf8"), "");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
