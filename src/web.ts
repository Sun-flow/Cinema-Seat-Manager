/**
 * Entry point for the web interface. Run it with `npm run web` (or
 * `node src/web.ts`), then open http://localhost:3000.
 *
 * Starts the server from src/server.ts on the port in the PORT environment
 * variable (3000 by default), listening on this computer only.
 */

import { createSeatServer } from "./server.ts";

const port = Number(process.env.PORT ?? 3000);
createSeatServer().listen(port, "127.0.0.1", () => {
  console.log(`Cinema Seat Manager is running at http://localhost:${port} (Ctrl+C to stop).`);
});
