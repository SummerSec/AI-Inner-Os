import { readJsonStdin, writeJsonStdout } from "../../hooks/lib/io.js";
import { getSessionId } from "../../hooks/lib/session.js";
import { readSessionState, writeSessionState } from "../../hooks/lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);

  await writeSessionState(sessionId, {
    ...state,
    enabled: true,
  });
} catch {
  // session state init failed, non-blocking
}
