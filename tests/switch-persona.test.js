import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const SCRIPT = fileURLToPath(
  new URL("../scripts/switch-persona.js", import.meta.url),
);
const ACTIVE_FILE = new URL("../personas/_active.json", import.meta.url);

async function runScript(...args) {
  const { stdout, stderr } = await run("node", [SCRIPT, ...args]);
  return { stdout, stderr };
}

describe("switch-persona script", () => {
  it("--list shows available personas", async () => {
    const { stdout } = await runScript("--list");
    assert.ok(stdout.includes("tsundere"));
    assert.ok(stdout.includes("sarcastic"));
    assert.ok(stdout.includes("cold"));
    assert.ok(stdout.includes("cheerful"));
    assert.ok(stdout.includes("philosopher"));
    assert.ok(stdout.includes("default"));
  });

  it("switches to a persona and updates _active.json", async () => {
    await runScript("tsundere");

    const raw = await readFile(ACTIVE_FILE, "utf8");
    const data = JSON.parse(raw);
    assert.equal(data.persona, "tsundere");
  });

  it("injects persona content into target files", async () => {
    await runScript("philosopher");

    const codex = await readFile(
      new URL("../codex/AGENTS.md", import.meta.url),
      "utf8",
    );
    assert.ok(codex.includes("<!-- ACTIVE_PERSONA_START -->"));
    assert.ok(codex.includes("philosopher（哲学家）"));
    assert.ok(codex.includes("<!-- ACTIVE_PERSONA_END -->"));
  });

  it("resets to default and clears persona content", async () => {
    await runScript("sarcastic");
    await runScript("default");

    const raw = await readFile(ACTIVE_FILE, "utf8");
    const data = JSON.parse(raw);
    assert.equal(data.persona, "default");

    const codex = await readFile(
      new URL("../codex/AGENTS.md", import.meta.url),
      "utf8",
    );
    const start = codex.indexOf("<!-- ACTIVE_PERSONA_START -->");
    const end = codex.indexOf("<!-- ACTIVE_PERSONA_END -->");
    const between = codex.slice(
      start + "<!-- ACTIVE_PERSONA_START -->".length,
      end,
    );
    assert.equal(between.trim(), "");
  });

  it("fails for nonexistent persona", async () => {
    try {
      await runScript("nonexistent_persona_xyz");
      assert.fail("should have thrown");
    } catch (err) {
      assert.ok(err.stderr.includes("找不到人设"));
    }
  });
});
