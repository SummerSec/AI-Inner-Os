import { normalizeToolEvent } from "./lib/events.js";
import { readJsonStdin, writeTextStdout } from "./lib/io.js";
import { buildRecentEventContext } from "./lib/prompt.js";
import { appendEvent } from "./lib/state.js";

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
const event = normalizeToolEvent(input);
const state = await appendEvent(sessionId, event);

writeTextStdout(buildRecentEventContext(state));
