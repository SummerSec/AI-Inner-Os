import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

const DEFAULT_PREFIX = "▎InnerOS：";
const DEFAULT_LOG_DIR = join(homedir(), ".inner-os", "monologues");
const FREQUENCY_THRESHOLDS = { low: 6, normal: 3, high: 1 };

function normalizeFrequency(value) {
  const frequency = String(value || "").toLowerCase();
  return Object.hasOwn(FREQUENCY_THRESHOLDS, frequency) ? frequency : "normal";
}

function buildFrequencyReminder(frequency) {
  return [
    `Inner OS 触发频率：${frequency}`,
    "根据当前任务，在关键判断、失败恢复、阶段推进或收尾时输出简短 `▎InnerOS：` 独白。",
    frequency === "high"
      ? "当前为 high 档：只要有新的阶段、工具结果或判断点，就优先输出一条。"
      : "当前为 normal/low 档：避免刷屏，但不要长时间完全不触发。",
  ].join("\n");
}

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

const plugin = definePluginEntry({
  id: "ai-inner-os",
  name: "AI Inner OS",
  description:
    "Expose the AI's visible inner monologue during work. Captures ▎InnerOS： outputs to structured JSONL logs.",

  register(api) {
    const config =
      api.config?.plugins?.entries?.["ai-inner-os"]?.config ??
      api.pluginConfig ??
      {};
    const logDir = config.logPath || DEFAULT_LOG_DIR;
    const frequency = normalizeFrequency(config.frequency);
    let turnsSinceReminder = 0;

    api.on("before_prompt_build", async () => {
      turnsSinceReminder += 1;
      if (turnsSinceReminder < FREQUENCY_THRESHOLDS[frequency]) return;

      turnsSinceReminder = 0;
      return {
        appendContext: buildFrequencyReminder(frequency),
      };
    });

    api.on("llm_output", async (event) => {
      try {
        const text = event.text || event.content || "";
        const monologues = extractMonologues(text);
        if (monologues.length === 0) return;
        turnsSinceReminder = 0;

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
});

export default plugin;
