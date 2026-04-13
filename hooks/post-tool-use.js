import { normalizeToolEvent } from "./lib/events.js";
import { readJsonStdin, writeTextStdout } from "./lib/io.js";
import { buildRecentEventContext } from "./lib/prompt.js";
import { getSessionId } from "./lib/session.js";
import { appendEvent } from "./lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const event = normalizeToolEvent(input);
  const state = await appendEvent(sessionId, event);

  writeTextStdout(buildRecentEventContext(state));
} catch {
  // Fail silently — hook errors should not interrupt the session.
}
