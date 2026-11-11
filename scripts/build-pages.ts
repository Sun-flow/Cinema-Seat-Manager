/**
 * Builds the GitHub Pages copy of the web interface. Run it with
 * `npm run build:pages`; it writes dist/index.html (or the folder given as
 * the first argument).
 *
 * GitHub Pages serves files only, so src/server.ts can't run there. Instead the
 * build puts the real seat code into the page itself:
 *   - src/seats.ts, src/savefile.ts and runCommand() from src/cli.ts, with
 *     their TypeScript types stripped by Node, so the page uses exactly the
 *     same functions, checks and messages as the command line;
 *   - web/pages-backend.js, which answers the page's /api/... requests in the
 *     browser and keeps saves in the browser (see that file).
 * web/index.html itself is reused unchanged apart from a few words that
 * mention the local server.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** The repository folder, worked out from this file's location. */
const REPO_DIR = fileURLToPath(new URL("..", import.meta.url));

/**
 * Turns one TypeScript module into plain script text for the page.
 *
 * Purpose: let the browser run the same source files as Node.
 * How it works: strips the types with Node's stripTypeScriptTypes(), removes
 *   import statements (the files are inlined in dependency order instead) and
 *   the "export" keyword, so every function becomes a plain script function.
 * Inputs: source, the TypeScript text.
 * Outputs: the JavaScript text.
 * Example:
 *   toScript("export const ROWS: number = 8;");   // "const ROWS         = 8;"
 */
export function toScript(source: string): string {
  return stripTypeScriptTypes(source)
    .replace(/^import[\s\S]*?from\s*"[^"]*";[ \t]*$/gm, "")
    .replace(/^export /gm, "");
}

/**
 * Builds the text of the Pages page.
 *
 * Purpose: everything the build does except writing the file, so tests can
 *   check it.
 * How it works: reads the seat code and the page, keeps only the part of
 *   src/cli.ts before the terminal loop (startLoop needs Node), puts the code
 *   and web/pages-backend.js in a <script> before the page's own script, and
 *   rewords the lines that mention the local server.
 * Inputs: repoDir, the repository folder (this repository by default).
 * Outputs: a promise of the page as one HTML string.
 * Example:
 *   const html = await buildPage();
 */
export async function buildPage(repoDir: string = REPO_DIR): Promise<string> {
  const read = (path: string): Promise<string> => readFile(join(repoDir, path), "utf8");
  const cli = await read("src/cli.ts");
  const loopStart = cli.indexOf("/**\n * Starts the interactive loop.");
  if (loopStart < 0) {
    throw new Error("src/cli.ts: can't find the comment above startLoop()");
  }
  const seatCode = [
    toScript(await read("src/seats.ts")),
    toScript(await read("src/savefile.ts")),
    toScript(cli.slice(0, loopStart)),
    await read("web/pages-backend.js"),
  ].join("\n");

  const page = await read("web/index.html");
  const replacements: [string, string][] = [
    ['<script type="module">', `<script>\n${seatCode}\n</script>\n  <script type="module">`],
    [
      "Saves to reservations/<span id=\"file-date\">[date]</span>.json",
      "Save keeps the room in this browser and downloads <span id=\"file-date\">[date]</span>.json",
    ],
    ["Served by src/server.ts (npm run web).", "Built for GitHub Pages by scripts/build-pages.ts."],
    ["ERROR: Can't reach the server. Is `npm run web` still running?", "ERROR: Something went wrong. Reload the page to try again."],
  ];
  let html = page;
  for (const [from, to] of replacements) {
    if (!html.includes(from)) {
      throw new Error(`web/index.html no longer contains: ${from}`);
    }
    html = html.replace(from, to);
  }
  return html;
}

/**
 * Writes the Pages page to a folder.
 *
 * Purpose: the entry point for `npm run build:pages` and the deploy workflow.
 * How it works: builds the page and writes it as index.html, creating the
 *   folder if needed. Adds an empty .nojekyll so GitHub serves the file as is.
 * Inputs: outDir, the folder to write (dist/ by default).
 * Outputs: a promise of the path written.
 * Example:
 *   await writePages("dist");
 */
export async function writePages(outDir: string = join(REPO_DIR, "dist")): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const path = join(outDir, "index.html");
  await writeFile(path, await buildPage());
  await writeFile(join(outDir, ".nojekyll"), "");
  return path;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = await writePages(process.argv[2]);
  console.log(`Wrote ${path}`);
}
