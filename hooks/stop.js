import { readJsonStdin } from "./lib/io.js";
import { getSessionId } from "./lib/session.js";
import { removeSessionState } from "./lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  await removeSessionState(sessionId);
} catch {
  // Fail silently — cleanup is best-effort.
}
