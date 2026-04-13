import { readFile } from "node:fs/promises";
import { SKILL_PATH } from "./constants.js";
import { extractToolTarget, inferEventType } from "./events.js";

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n*/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

export async function buildSessionStartContext() {
  try {
    const raw = await readFile(SKILL_PATH, "utf8");
    return stripFrontmatter(raw);
  } catch {
    return "本会话启用了 Inner OS。内心独白使用 ▎InnerOS：前缀输出。";
  }
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

  lines.push("", "你可以根据这些事实，自行决定是否输出 Inner OS 旁白，以及用什么风格输出。");

  return lines.join("\n");
}
