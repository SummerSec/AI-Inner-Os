import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);

test("session state is stored under CLAUDE_PLUGIN_DATA", async () => {
  const pluginData = await mkdtemp(join(tmpdir(), "inner-os-state-"));
  const script = `
    const { writeSessionState, getSessionStateFilename } = await import("./hooks/lib/state.js");
    await writeSessionState("session/with spaces", { recentEvents: [] });
    process.stdout.write(getSessionStateFilename("session/with spaces"));
  `;

  const { stdout } = await run("node", ["--input-type=module", "-e", script], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, CLAUDE_PLUGIN_DATA: pluginData },
  });

  const raw = await readFile(join(pluginData, "state", stdout), "utf8");
  const data = JSON.parse(raw);
  assert.equal(data.sessionId, "session_with_spaces");

  await rm(pluginData, { recursive: true, force: true });
});
