export function getSessionId(payload) {
  return (
    payload.session_id ||
    payload.sessionId ||
    payload.conversation_id ||
    payload.conversationId ||
    "default"
  );
}
