import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import {
  PERSONAS_DIR,
  ACTIVE_PERSONA_FILE,
  DEFAULT_PERSONA,
} from "./constants.js";

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n*/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

export async function ensurePersonasDir() {
  await mkdir(new URL("custom/", PERSONAS_DIR), { recursive: true });
}

export async function readActivePersona() {
  try {
    const raw = await readFile(ACTIVE_PERSONA_FILE, "utf8");
    const data = JSON.parse(raw);
    return data.persona || DEFAULT_PERSONA;
  } catch {
    return DEFAULT_PERSONA;
  }
}

export async function readPersonaContent(name) {
  if (!name || name === DEFAULT_PERSONA) return null;

  // Try root personas/ first
  try {
    const rootPath = new URL(`${name}.md`, PERSONAS_DIR);
    const raw = await readFile(rootPath, "utf8");
    return stripFrontmatter(raw);
  } catch {
    // fall through to custom/
  }

  // Try personas/custom/
  try {
    const customPath = new URL(`custom/${name}.md`, PERSONAS_DIR);
    const raw = await readFile(customPath, "utf8");
    return stripFrontmatter(raw);
  } catch {
    return null;
  }
}

export async function setActivePersona(name) {
  await ensurePersonasDir();
  const data = {
    persona: name || DEFAULT_PERSONA,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(ACTIVE_PERSONA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function listPersonas() {
  await ensurePersonasDir();
  const names = new Set();

  try {
    const rootFiles = await readdir(PERSONAS_DIR);
    for (const f of rootFiles) {
      if (f.endsWith(".md")) {
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
    // empty
  }

  return [...names].sort();
}
