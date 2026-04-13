import { EVENT_RESULTS, EVENT_TYPES } from "./constants.js";

function toText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return JSON.stringify(value);
}

export function inferEventType(toolName = "", payload = {}) {
  const normalizedTool = String(toolName).toLowerCase();
  const target = toText(payload.path || payload.target || payload.command).toLowerCase();

  if (normalizedTool.includes("read") || normalizedTool.includes("fetch")) {
    return EVENT_TYPES.READ;
  }

  if (
    normalizedTool.includes("glob") ||
    normalizedTool.includes("grep") ||
    normalizedTool.includes("search") ||
    normalizedTool.includes("rg") ||
    normalizedTool.includes("lsp")
  ) {
    return EVENT_TYPES.SEARCH;
  }

  if (normalizedTool.includes("bash") || normalizedTool.includes("shell") || payload.command) {
    if (target.includes("test") || target.includes("lint") || target.includes("check")) {
      return EVENT_TYPES.VERIFY;
    }

    return EVENT_TYPES.EXECUTE;
  }

  if (
    normalizedTool.includes("write") ||
    normalizedTool.includes("patch") ||
    normalizedTool.includes("edit") ||
    normalizedTool.includes("delete") ||
    normalizedTool.includes("notebook")
  ) {
    return EVENT_TYPES.EDIT;
  }

  return EVENT_TYPES.OTHER;
}

export function inferResult(payload = {}) {
  const exitCode = payload.exit_code ?? payload.exitCode;
  const success = payload.success;
  const status = String(payload.status || "").toLowerCase();

  if (typeof success === "boolean") {
    return success ? EVENT_RESULTS.SUCCESS : EVENT_RESULTS.FAILURE;
  }

  if (typeof exitCode === "number") {
    return exitCode === 0 ? EVENT_RESULTS.SUCCESS : EVENT_RESULTS.FAILURE;
  }

  if (status === "failed" || status === "error") {
    return EVENT_RESULTS.FAILURE;
  }

  if (status === "ok" || status === "success" || status === "completed") {
    return EVENT_RESULTS.SUCCESS;
  }

  return EVENT_RESULTS.UNKNOWN;
}

export function summarizePayload(toolName = "", payload = {}) {
  const target = payload.path || payload.target || payload.command || payload.description;

  if (target) {
    return `${toolName} -> ${toText(target)}`;
  }

  return `${toolName} executed`;
}

export function normalizeToolEvent(input = {}) {
  const toolName = input.tool_name || input.toolName || input.hook_event_name || "unknown";
  const payload = input.tool_input || input.payload || input;

  return {
    toolName,
    eventType: inferEventType(toolName, payload),
    result: inferResult(input),
    target: payload.path || payload.target || payload.command || null,
    summary: summarizePayload(toolName, payload),
    timestamp: new Date().toISOString(),
  };
}
