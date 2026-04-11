import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRecentEventContext,
  buildSessionStartContext,
} from "../hooks/lib/prompt.js";

test("buildSessionStartContext includes the Inner OS prefix contract", () => {
  const context = buildSessionStartContext();

  assert.match(context, /本会话启用了 Inner OS/);
  assert.match(context, /▎InnerOS：<你的内心独白>/);
});

test("buildRecentEventContext includes failure count when present", () => {
  const context = buildRecentEventContext({
    failureCount: 2,
    recentEvents: [
      {
        toolName: "Shell",
        eventType: "verify",
        result: "failure",
        target: "npm test",
      },
    ],
  });

  assert.match(context, /工具：Shell/);
  assert.match(context, /结果：failure/);
  assert.match(context, /对象：npm test/);
  assert.match(context, /连续失败次数：2/);
});
