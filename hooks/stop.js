import { readJsonStdin } from "./lib/io.js";
import { removeSessionState } from "./lib/state.js";

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
await removeSessionState(sessionId);
