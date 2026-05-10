import test from "node:test";
import assert from "node:assert/strict";
import { writeFile, mkdir, rm, mkdtemp, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import {
  readActivePersona,
  readPersonaContent,
  setActivePersona,
  listPersonas,
} from "../hooks/lib/persona.js";
import { PERSONAS_DIR, ACTIVE_PERSONA_FILE } from "../hooks/lib/constants.js";

const activePath = fileURLToPath(ACTIVE_PERSONA_FILE);
const personasDir = fileURLToPath(PERSONAS_DIR);
const run = promisify(execFile);

test("readActivePersona returns 'default' when _active.json missing", async () => {
  await rm(activePath, { force: true });
  const name = await readActivePersona();
  assert.equal(name, "default");
});

test("readActivePersona reads persona name from _active.json", async () => {
  await mkdir(personasDir, { recursive: true });
  await writeFile(activePath, JSON.stringify({ persona: "tsundere" }), "utf8");
  const name = await readActivePersona();
  assert.equal(name, "tsundere");
  await rm(activePath, { force: true });
});

test("readPersonaContent returns null for nonexistent persona", async () => {
  const content = await readPersonaContent("does-not-exist");
  assert.equal(content, null);
});

test("readPersonaContent reads and strips frontmatter from persona file", async () => {
  const tempPath = `${personasDir}_test_persona.md`;
  await writeFile(
    tempPath,
    "---\nname: test\ndisplayName: Test\n---\n\nTest persona content.",
    "utf8",
  );
  const content = await readPersonaContent("_test_persona");
  assert.equal(content, "Test persona content.");
  await rm(tempPath, { force: true });
});

test("readPersonaContent falls back to custom/ directory", async () => {
  const customDir = `${personasDir}custom/`;
  await mkdir(customDir, { recursive: true });
  const tempPath = `${customDir}_test_custom.md`;
  await writeFile(
    tempPath,
    "---\nname: test-custom\n---\n\nCustom content.",
    "utf8",
  );
  const content = await readPersonaContent("_test_custom");
  assert.equal(content, "Custom content.");
  await rm(tempPath, { force: true });
});

test("setActivePersona writes _active.json", async () => {
  await mkdir(personasDir, { recursive: true });
  await setActivePersona("philosopher");
  const name = await readActivePersona();
  assert.equal(name, "philosopher");
  await rm(activePath, { force: true });
});

test("setActivePersona writes active persona under CLAUDE_PLUGIN_DATA", async () => {
  const pluginData = await mkdtemp(join(tmpdir(), "inner-os-plugin-data-"));
  const script = `
    const { setActivePersona, readActivePersona } = await import("./hooks/lib/persona.js");
    await setActivePersona("cold");
    const name = await readActivePersona();
    if (name !== "cold") throw new Error("expected cold, got " + name);
  `;

  await run("node", ["--input-type=module", "-e", script], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, CLAUDE_PLUGIN_DATA: pluginData },
  });

  const raw = await readFile(join(pluginData, "personas", "_active.json"), "utf8");
  assert.equal(JSON.parse(raw).persona, "cold");

  await rm(pluginData, { recursive: true, force: true });
});

test("listPersonas returns array of persona names", async () => {
  const list = await listPersonas();
  assert.ok(Array.isArray(list));
});
