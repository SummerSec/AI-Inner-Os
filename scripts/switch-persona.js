#!/usr/bin/env node

import { readFile, writeFile, readdir } from "node:fs/promises";

const REPO_ROOT = new URL("../", import.meta.url);
const PERSONAS_DIR = new URL("personas/", REPO_ROOT);
const ACTIVE_PERSONA_FILE = new URL("personas/_active.json", REPO_ROOT);

const TARGET_FILES = [
  "codex/AGENTS.md",
  "cursor/rules/inner-os-protocol.mdc",
  "opencode/inner-os-rules.md",
  "hermes/hermes.md",
  "hermes/skills/inner-os/SKILL.md",
  "openclaw/skills/inner-os/SKILL.md",
];

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

async function injectIntoFile(filePath, content) {
  const fullPath = new URL(filePath, REPO_ROOT);
  let raw;
  try {
    raw = await readFile(fullPath, "utf8");
  } catch {
    console.log(`  跳过 ${filePath}（文件不存在）`);
    return false;
  }

  const startIdx = raw.indexOf(START_MARKER);
  const endIdx = raw.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.log(`  跳过 ${filePath}（未找到标记）`);
    return false;
  }

  if (startIdx >= endIdx) {
    console.error(`  错误 ${filePath}（标记顺序异常）`);
    return false;
  }

  const before = raw.slice(0, startIdx + START_MARKER.length);
  const after = raw.slice(endIdx);
  const updated = before + content + after;

  await writeFile(fullPath, updated, "utf8");
  console.log(`  ✓ ${filePath}`);
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
    for (const file of TARGET_FILES) {
      if (await injectIntoFile(file, "\n")) count++;
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
  for (const file of TARGET_FILES) {
    if (await injectIntoFile(file, block)) count++;
  }

  console.log(`\n切换完成，更新了 ${count} 个文件。`);
}

main().catch((err) => {
  console.error("错误：", err.message);
  process.exit(1);
});
