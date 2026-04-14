import { normalizeToolEvent } from "../../hooks/lib/events.js";
import { readJsonStdin } from "../../hooks/lib/io.js";
import { buildRecentEventContext } from "../../hooks/lib/prompt.js";
import { getSessionId } from "../../hooks/lib/session.js";
import { appendEvent } from "../../hooks/lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const event = normalizeToolEvent(input);
  const state = await appendEvent(sessionId, event);
  const context = buildRecentEventContext(state);

  if (context) {
    // Cursor postToolUse output: { additional_context: string }
    process.stdout.write(JSON.stringify({ additional_context: context }) + "\n");
  }
} catch {
  // Fail silently — hook errors should not interrupt the session.
}
