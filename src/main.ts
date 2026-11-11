/**
 * Entry point. Run it with `npm start` (or `node src/main.ts`).
 *
 * Creates an empty screening room and starts the interactive command loop.
 */

import { startLoop } from "./cli.ts";
import { createRoom } from "./seats.ts";

await startLoop(createRoom());
