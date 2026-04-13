import { readJsonStdin, writeJsonStdout } from "./lib/io.js";
import { buildPreToolContext } from "./lib/prompt.js";
import { getSessionId } from "./lib/session.js";
import { readSessionState } from "./lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);
  const context = buildPreToolContext(input, state);

  if (context) {
    writeJsonStdout({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: context,
      },
    });
  }
} catch {
  // Fail silently — hook errors should not interrupt the session.
}
