import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_PREFIX = "▎InnerOS：";
const DEFAULT_LOG_DIR = join(homedir(), ".inner-os", "monologues");

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function extractMonologues(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const monologues = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(DEFAULT_PREFIX)) {
      monologues.push(trimmed.slice(DEFAULT_PREFIX.length).trim());
    }
  }
  return monologues;
}

const plugin = {
  id: "ai-inner-os",
  name: "AI Inner OS",
  description:
    "Expose the AI's visible inner monologue during work. Captures ▎InnerOS： outputs to structured JSONL logs.",
  version: "0.7.1",

  register(api) {
    const config = api.config?.plugins?.entries?.["ai-inner-os"]?.config ?? {};
    const logDir = config.logPath || DEFAULT_LOG_DIR;

    api.on("llm_output", async (event) => {
      try {
        const text = event.text || event.content || "";
        const monologues = extractMonologues(text);
        if (monologues.length === 0) return;

        await ensureDir(logDir);
        const logFile = join(
          logDir,
          `${new Date().toISOString().split("T")[0]}.jsonl`,
        );

        for (const content of monologues) {
          const entry = {
            timestamp: new Date().toISOString(),
            sessionId: event.sessionId || event.runId || "",
            content,
          };
          await appendFile(logFile, JSON.stringify(entry) + "\n", "utf8");
        }

        api.logger?.info(
          `Inner OS: captured ${monologues.length} monologue(s)`,
        );
      } catch (err) {
        api.logger?.error(
          `Inner OS: failed to capture monologue: ${err.message}`,
        );
      }
    });
  },
};

export default plugin;
