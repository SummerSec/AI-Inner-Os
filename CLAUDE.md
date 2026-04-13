# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run check    # syntax validation on all hook scripts
npm test         # run tests (Node.js built-in test runner)
npm run lint     # alias for check
```

No build step. Pure ESM, Node.js >= 18.

## Architecture

AI Inner OS is a Claude Code plugin that injects a visible "inner monologue" layer into AI CLI sessions via lifecycle hooks. It also adapts to Codex CLI, Cursor, OpenCode CLI, Hermes Agent, and OpenClaw.

### Data Flow (Claude Code)

```
SessionStart → reads skills/inner-os/SKILL.md → injects protocol as additionalContext
     ↓
PreToolUse → reads session state → injects "[即将执行] ToolName → target" context
     ↓
Tool executes
     ↓
PostToolUse (success) → normalizes event → appends to state → injects recent events
PostToolUseFailure    → normalizes failure → increments failureCount → injects error context
     ↓
PreCompact → saves compactedAt timestamp
     ↓
Stop → deletes session state file
```

### Single Source of Truth

`skills/inner-os/SKILL.md` is the canonical Inner OS protocol. `hooks/lib/prompt.js` reads it at runtime (strips YAML frontmatter). The static copies in `codex/AGENTS.md`, `cursor/rules/inner-os-protocol.mdc`, `opencode/inner-os-rules.md`, and `hermes/hermes.md` are manually synchronized — there is no automated derivation. `hermes/skills/inner-os/SKILL.md` is a Hermes-compatible skill variant with extended frontmatter. `openclaw/skills/inner-os/SKILL.md` is an OpenClaw-compatible skill variant with AgentSkills metadata.

### hooks/lib/ — Shared Logic

All hook scripts (including codex/ and cursor/ adapters) import from `hooks/lib/`:

- **io.js** — stdin JSON reader, stdout JSON/text writers (the I/O boundary)
- **state.js** — per-session JSON files in `state/`, recent-events ring buffer (max 10), consecutive failure counter
- **events.js** — `inferEventType()` classifies tools by name; `inferResult()` derives success/failure; `normalizeToolEvent()` / `normalizeFailureEvent()` produce structured events; `extractToolTarget()` pulls the key field from tool input
- **prompt.js** — builds all `additionalContext` strings: session-start protocol, pre-tool context, post-tool recent-event context, failure context
- **session.js** — extracts session ID from various payload field names
- **constants.js** — plugin ID, prefix `▎InnerOS：`, paths (STATE_DIR, SKILL_PATH), event type/result enums

### Multi-Platform Adaptation

Platforms degrade gracefully in hook richness:

| Platform | Protocol mechanism | Hook scripts | Reuses hooks/lib/ |
|----------|-------------------|--------------|-------------------|
| Claude Code | Dynamic (reads SKILL.md) | 6 hooks | Yes (canonical) |
| Codex CLI | Static AGENTS.md | 4 hooks | Yes |
| Cursor | Static .mdc rule | 2 hooks | Yes |
| OpenCode | Static instructions file | None | No |
| Hermes Agent | Skill or .hermes.md context file | None | No |
| OpenClaw | Skill (AgentSkills format) | None | No |

### Plugin Registration

- `hooks/hooks.json` — Claude Code hook registration (the authoritative config)
- `.claude-plugin/plugin.json` — plugin identity for Claude Code
- `.claude-plugin/marketplace.json` — local marketplace listing
- `plugin.json` — repo-level metadata
- Version must be bumped in all three `plugin.json` / `package.json` files for updates to reach installed users

### Key Patterns

- Every hook wraps its body in `try/catch` and fails silently — hook errors never interrupt the session
- Session state files live in `state/` (gitignored), keyed by sanitized session ID
- `failureCount` increments on consecutive failures, resets to 0 on any success
- PreToolUse output uses `hookSpecificOutput.additionalContext`; PostToolUse/PostToolUseFailure output plain text to stdout
- Bash commands are truncated at 80 chars in target extraction
