import { readFile } from "node:fs/promises";
import { SKILL_PATH } from "./constants.js";
import { normalizeFrequency, readInnerOsConfig } from "./config.js";
import { extractToolTarget, inferEventType } from "./events.js";
import { readActivePersona, readPersonaContent } from "./persona.js";

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n*/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

export async function buildSessionStartContext() {
  let protocol;
  try {
    const raw = await readFile(SKILL_PATH, "utf8");
    protocol = stripFrontmatter(raw);
  } catch {
    protocol = "本会话启用了 Inner OS。内心独白使用 ▎InnerOS：前缀输出。";
  }

  try {
    const config = await readInnerOsConfig();
    protocol += "\n\n" + buildFrequencyContext(config.frequency);
  } catch {
    // frequency config is optional
  }

  try {
    const personaName = await readActivePersona();
    const personaText = await readPersonaContent(personaName);
    if (personaText) {
      return protocol + "\n\n---\n\n## 当前人设\n\n" + personaText;
    }
  } catch {
    // persona read failed, return protocol only
  }

  return protocol;
}

export function buildFrequencyContext(frequency = "normal") {
  const normalized = normalizeFrequency(frequency);
  const lines = [
    `Inner OS 触发频率：${normalized}`,
    "- low：只在关键判断、失败恢复、重要结论前输出",
    "- normal：每个任务至少一次；复杂任务在开始、转折、验证或收尾阶段可各输出一次",
    "- high：阶段推进、连续工具调用、失败重试、发现问题时都可以输出；避免每句话都刷屏",
  ];

  if (normalized === "high") {
    lines.push("当前为 high 档：只要有新的阶段、工具结果或判断点，就优先输出一条简短 `▎InnerOS：` 独白。");
  } else if (normalized === "normal") {
    lines.push("当前为 normal 档：本任务至少输出一次简短 `▎InnerOS：` 独白。");
  }

  return lines.join("\n");
}

function formatEvent(event, index) {
  const prefix = index === 0 ? "最新" : `#${index + 1}`;
  const parts = [`[${prefix}] ${event.toolName} (${event.eventType}) → ${event.result}`];

  if (event.target) {
    parts.push(`  对象：${event.target}`);
  }

  return parts.join("\n");
}

export function buildPreToolContext(input, state) {
  const toolName = input?.toolName || input?.tool_name;
  if (!toolName) return "";

  const toolInput = input?.toolInput || input?.tool_input || {};
  const target = extractToolTarget(toolName, toolInput);
  const eventType = inferEventType(toolName, toolInput);

  const parts = [`[即将执行] ${toolName} (${eventType})${target ? ` → ${target}` : ""}`];

  if (state?.failureCount > 0) {
    parts.push(`（连续失败 ${state.failureCount} 次后的重试）`);
  }

  return parts.join("\n");
}

export function buildFailureContext(input, state) {
  const toolName = input?.tool_name || input?.toolName;
  if (!toolName) return "";

  const error = input?.error || "unknown error";
  const toolInput = input?.tool_input || input?.toolInput || {};
  const target = extractToolTarget(toolName, toolInput);

  const parts = [`[执行失败] ${toolName}${target ? ` → ${target}` : ""}`];
  parts.push(`  错误：${error.length > 120 ? error.slice(0, 120) + "…" : error}`);

  if (state?.failureCount > 1) {
    parts.push(`  已连续失败 ${state.failureCount} 次`);
  }

  return parts.join("\n");
}

export function buildRecentEventContext(state) {
  const events = state?.recentEvents;

  if (!events?.length) {
    return "";
  }

  const window = events.slice(0, 3);
  const lines = ["最近发生的事情：", ""];

  for (let i = 0; i < window.length; i++) {
    lines.push(formatEvent(window[i], i));
  }

  if (state.failureCount > 0) {
    lines.push("", `连续失败次数：${state.failureCount}`);
  }

  if (state.shouldRemindInnerOs) {
    lines.push(
      "",
      `Inner OS 触发提醒（${normalizeFrequency(state.frequency)}）：最近已有多个工具事件或出现失败；本轮如有任何判断点，请输出一条简短的 \`▎InnerOS：\` 独白。`,
    );
  } else {
    lines.push("", "根据当前频率档位，在关键判断、失败恢复、阶段推进或收尾时输出简短 Inner OS 旁白。");
  }

  return lines.join("\n");
}

export function buildPostCompactContext(state) {
  const parts = ["上下文刚刚完成压缩。"];

  if (state?.compactedAt) {
    parts.push(`压缩时间：${state.compactedAt}`);
  }

  const recent = buildRecentEventContext(state);
  if (recent) {
    parts.push("", recent);
  } else {
    parts.push("", "Inner OS 状态已保留，你可以继续根据当前任务自行决定是否输出旁白。");
  }

  return parts.join("\n");
}
