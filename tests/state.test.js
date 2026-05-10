import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

test("session state reads frequency config and flags reminders", async () => {
  const pluginData = await mkdtemp(join(tmpdir(), "inner-os-frequency-"));
  await writeFile(join(pluginData, "config.json"), JSON.stringify({ frequency: "high" }), "utf8");
  const script = `
    const { appendEvent } = await import("./hooks/lib/state.js");
    const state = await appendEvent("frequency-session", {
      toolName: "Read",
      eventType: "read",
      result: "success",
      target: "README.md",
    });
    process.stdout.write(JSON.stringify({
      frequency: state.frequency,
      shouldRemindInnerOs: state.shouldRemindInnerOs,
      toolEventsSinceReminder: state.toolEventsSinceReminder,
    }));
  `;

  const { stdout } = await run("node", ["--input-type=module", "-e", script], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, CLAUDE_PLUGIN_DATA: pluginData },
  });

  const data = JSON.parse(stdout);
  assert.equal(data.frequency, "high");
  assert.equal(data.shouldRemindInnerOs, true);
  assert.equal(data.toolEventsSinceReminder, 0);

  await rm(pluginData, { recursive: true, force: true });
});
