import { normalizeToolEvent } from "../../hooks/lib/events.js";
import { readJsonStdin, writeJsonStdout } from "../../hooks/lib/io.js";
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
    // Codex PostToolUse: JSON with hookSpecificOutput.additionalContext
    writeJsonStdout({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: context,
      },
    });
  }
} catch {
  // Fail silently — hook errors should not interrupt the session.
}
