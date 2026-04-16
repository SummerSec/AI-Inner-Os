# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run check            # syntax validation on all hook scripts
npm test                 # run tests (Node.js built-in test runner)
npm run lint             # alias for check
npm run switch-persona   # switch persona across all platform files
  # usage: npm run switch-persona -- <name|default|--list>
node scripts/install.js  # global install for all platforms
  # usage: node scripts/install.js --all
  # usage: node scripts/install.js --platform cursor
```

No build step. Pure ESM, Node.js >= 18.

## Architecture

AI Inner OS is a Claude Code plugin that injects a visible "inner monologue" layer into AI CLI sessions via lifecycle hooks. It also adapts to Codex CLI, Cursor, OpenCode CLI, Hermes Agent, and OpenClaw.

### Data Flow (Claude Code)

```
SessionStart → reads protocol/SKILL.md → injects protocol as additionalContext
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

`protocol/SKILL.md` is the canonical Inner OS protocol. `hooks/lib/prompt.js` reads it at runtime (strips YAML frontmatter). The static copies in `codex/AGENTS.md`, `cursor/rules/inner-os-protocol.mdc`, `opencode/inner-os-rules.md`, and `hermes/hermes.md` are manually synchronized — there is no automated derivation. `hermes/skills/inner-os/SKILL.md` is a Hermes-compatible skill variant with extended frontmatter. `openclaw/skills/inner-os/SKILL.md` is an OpenClaw-compatible skill variant with AgentSkills metadata.

### Persona Switching Script

`scripts/switch-persona.js` handles cross-platform persona switching. It reads persona files from `personas/`, updates `personas/_active.json`, and injects the persona content between `<!-- ACTIVE_PERSONA_START -->` / `<!-- ACTIVE_PERSONA_END -->` markers in all 6 platform adapter files. The `/inner-os persona use` command calls this script via Bash.

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
| Codex CLI | SessionStart + PostToolUse + Stop | 3 hooks | Yes |
| Cursor | sessionStart + postToolUse + stop | 3 hooks | Yes |
| OpenCode | Plugin + static instructions | Plugin | No |
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
- Claude Code: PreToolUse uses `hookSpecificOutput.additionalContext`; PostToolUse/PostToolUseFailure output plain text to stdout
- Cursor: sessionStart/postToolUse use `{ additional_context: string }` top-level format; preToolUse removed (can't inject context)
- Codex: SessionStart outputs plain text to stdout; PostToolUse uses `hookSpecificOutput.additionalContext` JSON; PreToolUse removed (additionalContext not supported)
- Bash commands are truncated at 80 chars in target extraction

### Global Install Script

`scripts/install.js` handles global installation for all platforms. It copies shared core files (hooks/lib/, protocol/, personas/) to `~/.inner-os/`, then generates platform-specific config files with absolute paths. After global install, hook-based platforms (Cursor, Codex) read personas dynamically at runtime — no re-copying needed after persona switches.

### OpenCode Plugin

`opencode/plugins/inner-os.js` is an OpenCode plugin that provides a custom `inner-os` tool for status/persona management. It reads protocol and personas from the repo or `~/.inner-os/` at startup. Install to `~/.config/opencode/plugins/` for global use.

## Git Policy

**禁止在 Bash 工具中执行 `git commit` 和 `git push` 命令。** 这两个命令必须由用户手动执行。AI 可以执行其他 git 命令（如 `git status`、`git diff`、`git log`、`git add` 等），但提交和推送操作必须交由用户自行完成。
