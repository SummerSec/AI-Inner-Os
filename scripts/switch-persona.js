#!/usr/bin/env node

import { readFile, writeFile, readdir } from "node:fs/promises";

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const REPO_ROOT = new URL("../", import.meta.url);
const PERSONAS_DIR = new URL("personas/", REPO_ROOT);
const ACTIVE_PERSONA_FILE = new URL("personas/_active.json", REPO_ROOT);
const HOME = homedir();
const INNER_OS_HOME = join(HOME, ".inner-os");
const HAS_GLOBAL_INSTALL = existsSync(INNER_OS_HOME);

// Repo source files (always updated)
const TARGET_FILES = [
  "codex/AGENTS.md",
  "cursor/rules/inner-os-protocol.mdc",
  "opencode/inner-os-rules.md",
  "hermes/hermes.md",
  "hermes/skills/inner-os/SKILL.md",
  "openclaw/skills/inner-os/SKILL.md",
];

// Installed copies (updated when ~/.inner-os/ exists)
function getInstalledTargets() {
  if (!HAS_GLOBAL_INSTALL) return [];
  return [
    // Hermes skill installed copy
    join(HOME, ".hermes", "skills", "personality", "inner-os", "SKILL.md"),
    // OpenClaw skill installed copy
    join(HOME, ".openclaw", "skills", "inner-os", "SKILL.md"),
  ];
}

// Codex AGENTS.md uses different markers (INNER_OS_START/END wraps the whole file content)
// Persona markers inside AGENTS.md are handled by the normal injection above
function getCodexAgentsMd() {
  if (!HAS_GLOBAL_INSTALL) return null;
  const p = join(HOME, ".codex", "AGENTS.md");
  return existsSync(p) ? p : null;
}

const START_MARKER = "<!-- ACTIVE_PERSONA_START -->";
const END_MARKER = "<!-- ACTIVE_PERSONA_END -->";

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n*/);
  if (!match) return { meta: {}, body: raw.trim() };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    }
  }
  return { meta, body: raw.slice(match[0].length).trim() };
}

async function getPersonaNames() {
  const names = new Set();

  try {
    const rootFiles = await readdir(PERSONAS_DIR);
    for (const f of rootFiles) {
      if (f.endsWith(".md") && f !== "README.md") {
        names.add(f.replace(/\.md$/, ""));
      }
    }
  } catch {
    // empty
  }

  try {
    const customFiles = await readdir(new URL("custom/", PERSONAS_DIR));
    for (const f of customFiles) {
      if (f.endsWith(".md") && f !== "README.md") {
        names.add(f.replace(/\.md$/, ""));
      }
    }
  } catch {
    // custom dir may not exist
  }

  return [...names].sort();
}

async function readPersona(name) {
  const paths = [
    new URL(`${name}.md`, PERSONAS_DIR),
    new URL(`custom/${name}.md`, PERSONAS_DIR),
  ];

  for (const p of paths) {
    try {
      const raw = await readFile(p, "utf8");
      return parseFrontmatter(raw);
    } catch {
      continue;
    }
  }
  return null;
}

function buildPersonaBlock(name, meta, body) {
  const displayName = meta.displayName || name;
  const desc = meta.description || "";
  const header = `**当前人设：${name}（${displayName}）**${desc ? ` — ${desc}` : ""}`;
  return `\n${header}\n\n${body}\n`;
}

/**
 * Inject persona content between markers in a file.
 * Supports both URL paths (repo files) and absolute string paths (installed copies).
 */
async function injectIntoFile(filePath, content) {
  const isAbsolute = typeof filePath === "string" && filePath.startsWith("/");
  const fullPath = isAbsolute ? filePath : new URL(filePath, REPO_ROOT);
  const displayPath = isAbsolute ? filePath : filePath;
  let raw;
  try {
    raw = await readFile(fullPath, "utf8");
  } catch {
    console.log(`  跳过 ${displayPath}（文件不存在）`);
    return false;
  }

  const startIdx = raw.indexOf(START_MARKER);
  const endIdx = raw.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.log(`  跳过 ${displayPath}（未找到标记）`);
    return false;
  }

  if (startIdx >= endIdx) {
    console.error(`  错误 ${displayPath}（标记顺序异常）`);
    return false;
  }

  const before = raw.slice(0, startIdx + START_MARKER.length);
  const after = raw.slice(endIdx);
  const updated = before + content + after;

  await writeFile(fullPath, updated, "utf8");
  console.log(`  ✓ ${displayPath}`);
  return true;
}

async function setActivePersona(name) {
  const data = {
    persona: name,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(
    ACTIVE_PERSONA_FILE,
    JSON.stringify(data, null, 2) + "\n",
    "utf8",
  );
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log(
      "用法：node scripts/switch-persona.js <persona-name|default|--list>",
    );
    console.log("");
    console.log("  <name>     切换到指定人设");
    console.log("  default    恢复自由模式");
    console.log("  --list     列出所有可用人设");
    process.exit(0);
  }

  if (args[0] === "--list") {
    const names = await getPersonaNames();
    console.log("可用人设：");
    for (const name of names) {
      const persona = await readPersona(name);
      const display = persona?.meta?.displayName || name;
      const desc = persona?.meta?.description || "";
      console.log(`  ${name} (${display}) — ${desc}`);
    }
    process.exit(0);
  }

  const name = args[0];

  if (name === "default") {
    console.log("恢复自由模式...");
    await setActivePersona("default");
    let count = 0;
    // Update repo source files
    for (const file of TARGET_FILES) {
      if (await injectIntoFile(file, "\n")) count++;
    }
    // Update installed copies (if global install exists)
    if (HAS_GLOBAL_INSTALL) {
      console.log("  更新已安装副本...");
      for (const file of getInstalledTargets()) {
        if (await injectIntoFile(file, "\n")) count++;
      }
      const codexMd = getCodexAgentsMd();
      if (codexMd) {
        if (await injectIntoFile(codexMd, "\n")) count++;
      }
    }
    console.log(`\n已恢复自由模式，更新了 ${count} 个文件。`);
    process.exit(0);
  }

  const persona = await readPersona(name);
  if (!persona) {
    console.error(`错误：找不到人设 "${name}"`);
    console.error("运行 --list 查看可用人设。");
    process.exit(1);
  }

  const block = buildPersonaBlock(name, persona.meta, persona.body);

  console.log(`切换到人设：${name}（${persona.meta.displayName || name}）...`);
  await setActivePersona(name);

  let count = 0;
  // Update repo source files
  for (const file of TARGET_FILES) {
    if (await injectIntoFile(file, block)) count++;
  }
  // Update installed copies (if global install exists)
  if (HAS_GLOBAL_INSTALL) {
    console.log("  更新已安装副本...");
    for (const file of getInstalledTargets()) {
      if (await injectIntoFile(file, block)) count++;
    }
    const codexMd = getCodexAgentsMd();
    if (codexMd) {
      if (await injectIntoFile(codexMd, block)) count++;
    }
  }

  console.log(`\n切换完成，更新了 ${count} 个文件。`);
}

main().catch((err) => {
  console.error("错误：", err.message);
  process.exit(1);
});
