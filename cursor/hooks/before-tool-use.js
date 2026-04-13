import { readJsonStdin, writeJsonStdout } from "../../hooks/lib/io.js";
import { buildPreToolContext } from "../../hooks/lib/prompt.js";
import { getSessionId } from "../../hooks/lib/session.js";
import { readSessionState } from "../../hooks/lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);
  const context = buildPreToolContext(input, state);

  if (context) {
    writeJsonStdout({ additionalContext: context });
  }
} catch {
  // Fail silently
}
