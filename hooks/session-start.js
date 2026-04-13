import { readJsonStdin, writeJsonStdout } from "./lib/io.js";
import { buildSessionStartContext } from "./lib/prompt.js";
import { getSessionId } from "./lib/session.js";
import { readSessionState, writeSessionState } from "./lib/state.js";

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);

  await writeSessionState(sessionId, {
    ...state,
    enabled: true,
  });

  writeJsonStdout({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: buildSessionStartContext(),
    },
  });
} catch {
  writeJsonStdout({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: buildSessionStartContext(),
    },
  });
}
