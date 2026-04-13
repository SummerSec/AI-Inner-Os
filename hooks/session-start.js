import { readJsonStdin, writeJsonStdout } from "./lib/io.js";
import { buildSessionStartContext } from "./lib/prompt.js";
import { getSessionId } from "./lib/session.js";
import { readSessionState, writeSessionState } from "./lib/state.js";

const context = await buildSessionStartContext();

try {
  const input = await readJsonStdin();
  const sessionId = getSessionId(input);
  const state = await readSessionState(sessionId);

  await writeSessionState(sessionId, {
    ...state,
    enabled: true,
  });
} catch {
  // session state failed, still inject the protocol below
}

writeJsonStdout({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: context,
  },
});
