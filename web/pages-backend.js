// Stand-in for src/server.ts on GitHub Pages, where no server runs.
//
// scripts/build-pages.ts inlines this file into the Pages copy of
// web/index.html, after the real seat code (src/seats.ts, src/savefile.ts and
// runCommand from src/cli.ts, with their types stripped). It answers the same
// /api/... requests the page sends to the local server, so the page itself is
// unchanged. Differences from the local server:
//   - Save keeps the room in this browser (localStorage) and downloads
//     <date>.json, instead of writing reservations/<date>.json.
//   - A Load button opens a saved .json file.
// The seat data is still the 8 x 10 2D array of 0s and 1s.

(function () {
  /** The localStorage key for the saved room. */
  const STORAGE_KEY = "cinema-seat-manager:save";

  /**
   * Reads the room saved in this browser, if any.
   * Purpose: pick up where the last Save left off, like the server loading today's file.
   * How it works: reads STORAGE_KEY and checks its "room" with isRoom(). Storage
   *   can be missing or blocked, so every error just means "no save".
   * Inputs: none.
   * Outputs: [room, message]; room is null when there is no usable save.
   * Example: const [saved, message] = loadFromBrowser();
   */
  function loadFromBrowser() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved !== null && isRoom(saved.room)) {
        return [saved.room, `INFO: Loaded the room saved in this browser on ${saved.date}.`];
      }
    } catch {
      // Falls through to the message below.
    }
    return [null, "INFO: No save in this browser yet, so the room starts empty."];
  }

  /**
   * Saves the room in this browser and downloads it as <date>.json.
   * Purpose: what Save does on GitHub Pages.
   * How it works: builds the file with saveFileText(), stores it under
   *   STORAGE_KEY, and starts a download of the same text.
   * Inputs: room, the 2D seat array.
   * Outputs: a status message.
   * Example: saveToBrowser(room);
   */
  function saveToBrowser(room) {
    const date = dateStamp();
    const text = saveFileText(room, date, new Date());
    let stored = true;
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      stored = false;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    link.download = `${date}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return stored
      ? `SUCCESS: Saved the room in this browser and downloaded ${date}.json.`
      : `SUCCESS: Downloaded ${date}.json. This browser blocks storage, so it won't reopen here on its own.`;
  }

  let [room, loadMessage] = loadFromBrowser();
  room ??= createRoom();
  let loadReported = false;

  /**
   * Builds a reply shaped like the server's (see stateJson() in src/server.ts).
   * Inputs: message, the status message. Outputs: a fetch Response holding JSON.
   * Example: reply("INFO: Ready.");
   */
  function reply(message) {
    const [occupied, available] = countOccupancy(room);
    const body = JSON.stringify({ message, room, occupied, available, pair: findAdjacentPair(room) });
    return new Response(body, { headers: { "Content-Type": "application/json" } });
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (path, init = {}) => {
    if (typeof path !== "string" || !path.startsWith("/api/")) return realFetch(path, init);
    if (path === "/api/state") {
      const message = loadReported ? occupancyMessage(room) : loadMessage;
      loadReported = true;
      return reply(message);
    }
    if (path === "/api/command") {
      let command;
      try {
        command = JSON.parse(init.body).command;
      } catch {
        command = undefined;
      }
      if (typeof command !== "string") return reply('INVALID INPUT: Send {"command": "..."}.');
      return reply(runCommand(room, command)[0]);
    }
    if (path === "/api/new") {
      room = createRoom();
      return reply("SUCCESS: Started a new, empty room.");
    }
    if (path === "/api/save") return reply(saveToBrowser(room));
    return reply(`INVALID INPUT: No such page: ${path}.`);
  };

  /**
   * Opens a saved .json file and makes it the room.
   * Purpose: the Load button, so a downloaded save can be used again.
   * How it works: reads the chosen file, checks its "room" with isRoom(), and
   *   asks the page to redraw through /api/state.
   * Inputs: file, the File the user picked.
   * Outputs: a promise of the status message.
   * Example: await loadFile(input.files[0]);
   */
  async function loadFile(file) {
    let saved = null;
    try {
      saved = JSON.parse(await file.text());
    } catch {
      saved = null;
    }
    if (saved === null || !isRoom(saved.room)) {
      loadMessage = `FAILED: ${file.name} is not a valid saved room, so nothing changed.`;
    } else {
      room = saved.room;
      loadMessage = `SUCCESS: Loaded the room from ${file.name}. Press Save to keep it in this browser.`;
    }
    loadReported = false;
    return loadMessage;
  }

  // Adds the Load button next to Save once the page is ready.
  document.addEventListener("DOMContentLoaded", () => {
    const save = document.getElementById("save");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.hidden = true;
    input.id = "load-file";
    const load = document.createElement("button");
    load.id = "load";
    load.className = save.className;
    load.textContent = "Load";
    load.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      if (input.files.length === 0) return;
      await loadFile(input.files[0]);
      input.value = "";
      window.dispatchEvent(new Event("seat-manager:reload"));
    });
    save.before(load, input);
  });
})();
