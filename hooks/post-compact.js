import { readJsonStdin, writeTextStdout } from "./lib/io.js";
import { buildPostCompactContext } from "./lib/prompt.js";
import { getSessionId } from "./lib/session.js";
import { readSessionState, writeSessionState } from "./lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);
  const nextState = await writeSessionState(sessionId, {
    ...state,
    compactedAt: state.compactedAt || new Date().toISOString(),
    postCompactedAt: new Date().toISOString(),
  });

  writeTextStdout(buildPostCompactContext(nextState));
} catch {
  // Fail silently — hook errors should not interrupt the session.
}
