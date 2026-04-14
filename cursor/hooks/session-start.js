import { readJsonStdin } from "../../hooks/lib/io.js";
import { buildSessionStartContext } from "../../hooks/lib/prompt.js";
import { getSessionId } from "../../hooks/lib/session.js";
import { readSessionState, writeSessionState } from "../../hooks/lib/state.js";

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

// Cursor sessionStart output: { additional_context: string }
process.stdout.write(JSON.stringify({ additional_context: context }) + "\n");
