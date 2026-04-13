import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRecentEventContext,
  buildSessionStartContext,
} from "../hooks/lib/prompt.js";

test("buildSessionStartContext reads protocol from SKILL.md", async () => {
  const context = await buildSessionStartContext();

  assert.match(context, /Inner OS/);
  assert.match(context, /▎InnerOS：/);
});

test("buildRecentEventContext includes failure count when present", () => {
  const context = buildRecentEventContext({
    failureCount: 2,
    recentEvents: [
      {
        toolName: "Bash",
        eventType: "verify",
        result: "failure",
        target: "npm test",
      },
    ],
  });

  assert.match(context, /Bash/);
  assert.match(context, /failure/);
  assert.match(context, /对象：npm test/);
  assert.match(context, /连续失败次数：2/);
});

test("buildRecentEventContext shows up to 3 recent events", () => {
  const context = buildRecentEventContext({
    failureCount: 0,
    recentEvents: [
      { toolName: "Edit", eventType: "edit", result: "success", target: "a.js" },
      { toolName: "Read", eventType: "read", result: "success", target: "b.js" },
      { toolName: "Grep", eventType: "search", result: "success", target: "foo" },
      { toolName: "Bash", eventType: "execute", result: "success", target: "ls" },
    ],
  });

  assert.match(context, /Edit/);
  assert.match(context, /Read/);
  assert.match(context, /Grep/);
  assert.ok(!context.includes("Bash"), "should only show 3 events");
});
