import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const PROTOCOL_PATH = join(REPO_ROOT, "protocol/SKILL.md");
const PERSONAS_DIR = join(REPO_ROOT, "personas");
const ACTIVE_PERSONA_FILE = join(PERSONAS_DIR, "_active.json");

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n*/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

async function readProtocol() {
  try {
    const raw = await readFile(PROTOCOL_PATH, "utf8");
    return stripFrontmatter(raw);
  } catch {
    return "本会话启用了 Inner OS。内心独白使用 ▎InnerOS：前缀输出。";
  }
}

async function readActivePersonaName() {
  try {
    const raw = await readFile(ACTIVE_PERSONA_FILE, "utf8");
    return JSON.parse(raw).persona || "default";
  } catch {
    return "default";
  }
}

async function readPersonaContent(name) {
  if (!name || name === "default") return null;
  const paths = [
    join(PERSONAS_DIR, `${name}.md`),
    join(PERSONAS_DIR, "custom", `${name}.md`),
  ];
  for (const p of paths) {
    try {
      const raw = await readFile(p, "utf8");
      return stripFrontmatter(raw);
    } catch {
      continue;
    }
  }
  return null;
}

async function listPersonas() {
  const names = new Set();
  try {
    for (const f of await readdir(PERSONAS_DIR)) {
      if (f.endsWith(".md") && f !== "README.md") names.add(f.replace(/\.md$/, ""));
    }
  } catch { /* empty */ }
  try {
    for (const f of await readdir(join(PERSONAS_DIR, "custom"))) {
      if (f.endsWith(".md") && f !== "README.md") names.add(f.replace(/\.md$/, ""));
    }
  } catch { /* empty */ }
  return [...names].sort();
}

export const InnerOsPlugin = async ({ directory, client }) => {
  let protocol = await readProtocol();
  const personaName = await readActivePersonaName();
  const personaContent = await readPersonaContent(personaName);

  if (personaContent) {
    protocol += "\n\n---\n\n## 当前人设\n\n" + personaContent;
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        try {
          await client.app.log({
            body: {
              service: "inner-os",
              level: "info",
              message: "Inner OS session started",
              extra: { persona: personaName },
            },
          });
        } catch {
          // logging is best-effort
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      // OpenCode tool.execute.after — observation only
    },

    tool: {
      "inner-os": {
        description:
          "Show Inner OS status, list/switch personas. Actions: status, persona-list, persona-use <name>, persona-reset",
        args: {
          action: { type: "string", description: "status | persona-list | persona-use | persona-reset", optional: true },
          name: { type: "string", description: "Persona name (for persona-use)", optional: true },
        },
        async execute(args) {
          const action = args.action || "status";

          if (action === "status") {
            const current = await readActivePersonaName();
            return [
              "Inner OS Status: Enabled",
              "Monologue Prefix: ▎InnerOS：",
              `Current Persona: ${current}`,
              "",
              "GitHub: https://github.com/SummerSec/AI-Inner-Os",
              "完全开源免费，如果觉得有用请 ⭐ Star 支持！",
            ].join("\n");
          }

          if (action === "persona-list") {
            const personas = await listPersonas();
            return "可用人设：\n" + personas.map((n) => `  - ${n}`).join("\n");
          }

          if (action === "persona-use") {
            if (!args.name) return "请指定人设名称，例如：persona-use tsundere";
            // Delegate to switch-persona script
            const { execSync } = await import("node:child_process");
            try {
              const result = execSync(
                `node ${JSON.stringify(join(REPO_ROOT, "scripts/switch-persona.js"))} ${args.name}`,
                { encoding: "utf8", cwd: REPO_ROOT },
              );
              return result.trim();
            } catch (err) {
              return `切换失败：${err.message}`;
            }
          }

          if (action === "persona-reset") {
            const { execSync } = await import("node:child_process");
            try {
              const result = execSync(
                `node ${JSON.stringify(join(REPO_ROOT, "scripts/switch-persona.js"))} default`,
                { encoding: "utf8", cwd: REPO_ROOT },
              );
              return result.trim();
            } catch (err) {
              return `重置失败：${err.message}`;
            }
          }

          return `未知操作：${action}。可用操作：status, persona-list, persona-use, persona-reset`;
        },
      },
    },
  };
};
