import test from "node:test";
import assert from "node:assert/strict";

import {
  inferEventType,
  inferResult,
  normalizeToolEvent,
} from "../hooks/lib/events.js";

test("inferEventType recognizes verification shell commands", () => {
  const type = inferEventType("Shell", { command: "npm test" });
  assert.equal(type, "verify");
});

test("inferResult returns failure for non-zero exit codes", () => {
  const result = inferResult({ exit_code: 1 });
  assert.equal(result, "failure");
});

test("normalizeToolEvent builds a useful shell event summary", () => {
  const event = normalizeToolEvent({
    tool_name: "Shell",
    tool_input: { command: "npm run check" },
    exit_code: 0,
  });

  assert.equal(event.toolName, "Shell");
  assert.equal(event.eventType, "verify");
  assert.equal(event.result, "success");
  assert.equal(event.target, "npm run check");
  assert.match(event.summary, /Shell -> npm run check/);
});
