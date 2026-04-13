import { readJsonStdin } from "./lib/io.js";
import { getSessionId } from "./lib/session.js";
import { readSessionState, writeSessionState } from "./lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);

  await writeSessionState(sessionId, {
    ...state,
    compactedAt: new Date().toISOString(),
  });
} catch {
  // Fail silently — hook errors should not interrupt the session.
}
