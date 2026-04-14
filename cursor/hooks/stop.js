import { readJsonStdin } from "../../hooks/lib/io.js";
import { getSessionId } from "../../hooks/lib/session.js";
import { removeSessionState } from "../../hooks/lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  await removeSessionState(sessionId);
} catch {
  // Best-effort cleanup only
}
