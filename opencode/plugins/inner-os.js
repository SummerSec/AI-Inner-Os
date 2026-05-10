import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { tool } from "@opencode-ai/plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const INNER_OS_HOME = join(homedir(), ".inner-os");
const ROOTS = [REPO_ROOT, INNER_OS_HOME];
const FREQUENCIES = new Set(["low", "normal", "high"]);

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n*/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

async function readProtocol() {
  for (const root of ROOTS) {
    try {
      const raw = await readFile(join(root, "protocol", "SKILL.md"), "utf8");
      return stripFrontmatter(raw);
    } catch {
      continue;
    }
  }
  return "本会话启用了 Inner OS。内心独白使用 ▎InnerOS：前缀输出。";
}

async function readFrequency() {
  try {
    const raw = await readFile(join(INNER_OS_HOME, "config.json"), "utf8");
    const frequency = String(JSON.parse(raw).frequency || "").toLowerCase();
    return FREQUENCIES.has(frequency) ? frequency : "normal";
  } catch {
    return "normal";
  }
}

function buildFrequencyContext(frequency) {
  return [
    `Inner OS 触发频率：${frequency}`,
    frequency === "high"
      ? "当前为 high 档：阶段推进、工具结果、失败重试或发现问题时，优先输出一条简短 `▎InnerOS：` 独白。"
      : "根据当前任务，在关键判断、失败恢复、阶段推进或收尾时输出简短 `▎InnerOS：` 独白。",
  ].join("\n");
}

async function readActivePersonaName() {
  for (const root of [INNER_OS_HOME, REPO_ROOT]) {
    try {
      const raw = await readFile(join(root, "personas", "_active.json"), "utf8");
      return JSON.parse(raw).persona || "default";
    } catch {
      continue;
    }
  }
  return "default";
}

async function readPersonaContent(name) {
  if (!name || name === "default") return null;
  const paths = [
    ...ROOTS.map((root) => join(root, "personas", `${name}.md`)),
    ...ROOTS.map((root) => join(root, "personas", "custom", `${name}.md`)),
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
  for (const root of ROOTS) {
    try {
      for (const f of await readdir(join(root, "personas"))) {
        if (f.endsWith(".md") && f !== "README.md") names.add(f.replace(/\.md$/, ""));
      }
    } catch {
      // empty
    }
    try {
      for (const f of await readdir(join(root, "personas", "custom"))) {
        if (f.endsWith(".md") && f !== "README.md") names.add(f.replace(/\.md$/, ""));
      }
    } catch {
      // empty
    }
  }
  return [...names].sort();
}

async function runSwitchPersona(name) {
  const { execSync } = await import("node:child_process");
  let lastError;

  for (const root of ROOTS) {
    try {
      const script = join(root, "scripts", "switch-persona.js");
      return execSync(`node ${JSON.stringify(script)} ${name}`, {
        encoding: "utf8",
        cwd: root,
      }).trim();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("switch-persona.js not found");
}

export const InnerOsPlugin = async ({ directory, client }) => {
  let protocol = await readProtocol();
  const frequency = await readFrequency();
  protocol += "\n\n" + buildFrequencyContext(frequency);
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
      "inner-os": tool({
        description:
          "Show Inner OS status, list/switch personas. Actions: status, persona-list, persona-use <name>, persona-reset",
        args: {
          action: tool.schema
            .string()
            .describe("status | persona-list | persona-use | persona-reset")
            .optional(),
          name: tool.schema
            .string()
            .describe("Persona name for persona-use")
            .optional(),
        },
        async execute(args) {
          const action = args.action || "status";

          if (action === "status") {
            const current = await readActivePersonaName();
            return [
              "Inner OS Status: Enabled",
              "Monologue Prefix: ▎InnerOS：",
              `Current Persona: ${current}`,
              `Frequency: ${await readFrequency()}`,
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
            try {
              return await runSwitchPersona(args.name);
            } catch (err) {
              return `切换失败：${err.message}`;
            }
          }

          if (action === "persona-reset") {
            try {
              return await runSwitchPersona("default");
            } catch (err) {
              return `重置失败：${err.message}`;
            }
          }

          return `未知操作：${action}。可用操作：status, persona-list, persona-use, persona-reset`;
        },
      }),
    },
  };
};
