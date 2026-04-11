import { buildSessionStartContext } from "./lib/prompt.js";
import { readJsonStdin, writeJsonStdout } from "./lib/io.js";
import { readSessionState, writeSessionState } from "./lib/state.js";

function getSessionId(payload) {
  return (
    payload.session_id ||
    payload.sessionId ||
    payload.conversation_id ||
    payload.conversationId ||
    "default"
  );
}

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
