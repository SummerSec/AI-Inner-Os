import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename } from "node:path";

import { MAX_RECENT_EVENTS, STATE_DIR } from "./constants.js";

function sanitizeSessionId(sessionId) {
  return String(sessionId || "default").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getStateFileUrl(sessionId) {
  return new URL(`${sanitizeSessionId(sessionId)}.json`, STATE_DIR);
}

export async function ensureStateDir() {
  await mkdir(STATE_DIR, { recursive: true });
}

export async function readSessionState(sessionId) {
  await ensureStateDir();

  try {
    const raw = await readFile(getStateFileUrl(sessionId), "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      enabled: true,
      sessionId: sanitizeSessionId(sessionId),
      failureCount: 0,
      lastTool: null,
      recentEvents: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function writeSessionState(sessionId, state) {
  await ensureStateDir();

  const nextState = {
    enabled: true,
    ...state,
    sessionId: sanitizeSessionId(sessionId),
    updatedAt: new Date().toISOString(),
  };

  await writeFile(
    getStateFileUrl(sessionId),
    JSON.stringify(nextState, null, 2),
    "utf8",
  );

  return nextState;
}

export async function appendEvent(sessionId, event) {
  const state = await readSessionState(sessionId);
  const recentEvents = [event, ...(state.recentEvents || [])].slice(
    0,
    MAX_RECENT_EVENTS,
  );

  const failureCount =
    event.result === "failure" ? (state.failureCount || 0) + 1 : 0;

  return writeSessionState(sessionId, {
    ...state,
    lastTool: event.toolName,
    failureCount,
    recentEvents,
  });
}

export async function removeSessionState(sessionId) {
  try {
    await rm(getStateFileUrl(sessionId), { force: true });
  } catch {
    // Best-effort cleanup only.
  }
}

export function getSessionStateFilename(sessionId) {
  return basename(getStateFileUrl(sessionId).pathname);
}
