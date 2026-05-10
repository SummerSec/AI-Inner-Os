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
PostCompact → injects compact-continuity context with recent events
SubagentStart/SubagentStop → records subagent lifecycle events
     ↓
Stop → deletes session state file
```

### Single Source of Truth

`protocol/SKILL.md` is the canonical Inner OS protocol. `hooks/lib/prompt.js` reads it at runtime (strips YAML frontmatter). The static copies in `codex/AGENTS.md`, `cursor/rules/inner-os-protocol.mdc`, `opencode/inner-os-rules.md`, and `hermes/hermes.md` are manually synchronized — there is no automated derivation. `hermes/skills/inner-os/SKILL.md` is a Hermes-compatible skill variant with extended frontmatter. `openclaw/skills/inner-os/SKILL.md` is an OpenClaw-compatible skill variant with AgentSkills metadata.

### Persona Switching Script

`scripts/switch-persona.js` handles persona switching for both repository/global-install workflows and Claude Code plugin runtime:

- Repository/global install: reads persona files from `personas/`, updates `personas/_active.json`, and injects persona content between `<!-- ACTIVE_PERSONA_START -->` / `<!-- ACTIVE_PERSONA_END -->` markers in all platform adapter files.
- Claude Code plugin runtime: when `CLAUDE_PLUGIN_DATA` is present, writes the active persona to `${CLAUDE_PLUGIN_DATA}/personas/_active.json` and does **not** modify plugin cache source files.
- `/inner-os persona use` calls this script via Bash from the installed Claude Code plugin.

### hooks/lib/ — Shared Logic

All hook scripts (including codex/ and cursor/ adapters) import from `hooks/lib/`:

- **io.js** — stdin JSON reader, stdout JSON/text writers (the I/O boundary)
- **state.js** — per-session JSON files in `${CLAUDE_PLUGIN_DATA}/state/` for Claude Code plugin installs, falling back to repo `state/` outside plugin runtime; recent-events ring buffer (max 10), consecutive failure counter
- **events.js** — `inferEventType()` classifies tools by name; `inferResult()` derives success/failure; `normalizeToolEvent()` / `normalizeFailureEvent()` produce structured events; `extractToolTarget()` pulls the key field from tool input
- **prompt.js** — builds all `additionalContext` strings: session-start protocol, pre-tool context, post-tool recent-event context, failure context
- **session.js** — extracts session ID from various payload field names
- **constants.js** — plugin ID, prefix `▎InnerOS：`, paths (PLUGIN_DATA_DIR, STATE_DIR, SKILL_PATH, persona paths), event type/result enums

### Multi-Platform Adaptation

Platforms degrade gracefully in hook richness:

| Platform | Protocol mechanism | Hook scripts | Reuses hooks/lib/ |
|----------|-------------------|--------------|-------------------|
| Claude Code | Dynamic (reads SKILL.md) | 9 hooks | Yes (canonical) |
| Codex CLI | SessionStart + PostToolUse + Stop | 3 hooks | Yes |
| Cursor | sessionStart + postToolUse + stop | 3 hooks | Yes |
| OpenCode | Plugin + static instructions | Plugin | No |
| Hermes Agent | Skill or .hermes.md context file | None | No |
| OpenClaw | Skill (AgentSkills format) | None | No |

### Plugin Registration

- `hooks/hooks.json` — Claude Code hook registration (the authoritative config)
- `.claude-plugin/plugin.json` — plugin identity for Claude Code
- `.claude-plugin/marketplace.json` — local marketplace listing
- `.codex-plugin/plugin.json` — plugin identity and component paths for Codex plugin packaging
- `.agents/plugins/marketplace.json` — repo-scoped Codex marketplace metadata
- `.cursor-plugin/plugin.json` — plugin identity and component paths for Cursor plugin packaging
- `.cursor-plugin/marketplace.json` — Cursor marketplace metadata
- `plugin.json` — repo-level metadata
- Version must be bumped across all platform manifests and package metadata for updates to reach installed users: `package.json`, `plugin.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`, and `openclaw.plugin.json`

### Claude Code Plugin Standards

Follow the Claude Code plugin reference when changing Claude plugin packaging:

- The Claude Code manifest lives at `.claude-plugin/plugin.json`. Only manifest files belong under `.claude-plugin/`; component directories stay at the plugin root.
- Default component locations are root-level `commands/`, `skills/`, `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `output-styles/`, `themes/`, and `monitors/`.
- Custom component paths in `.claude-plugin/plugin.json` must be relative to the plugin root and start with `./`. Do not use absolute paths or `..` traversal.
- Hook commands bundled with the plugin must reference plugin files through `${CLAUDE_PLUGIN_ROOT}`. Do not assume the repository checkout path exists after marketplace installation.
- Persistent state must go under `${CLAUDE_PLUGIN_DATA}`. Do not write mutable runtime data, active persona settings, caches, or generated files into the plugin root/cache.
- Marketplace installs are cached by plugin version. If `.claude-plugin/plugin.json` has an explicit `version`, bump it for every published update; pushing commits alone is not enough.
- Validate packaging changes with `claude plugin validate .`, then run `npm run check` and `npm test`.

### Cursor Plugin Standards

This repository also ships Cursor plugin metadata because AI Inner OS is multi-platform:

- Cursor plugin metadata lives in `.cursor-plugin/plugin.json`; `.cursor-plugin/marketplace.json` is the Cursor marketplace metadata entry.
- The current Cursor design uses `cursor/` as the plugin component directory. `.cursor-plugin/plugin.json` points to `rules: "./cursor/rules/"` and `hooks: "./cursor/hooks.json"`.
- Cursor component paths must be relative, stay inside the plugin/repository root, and must not use absolute paths or `..` traversal.
- Cursor rules are `.mdc` files with YAML frontmatter. `cursor/rules/inner-os-protocol.mdc` must keep `description` and `alwaysApply: true`.
- Cursor hooks use lowercase event names in this repo's Cursor adapter: `sessionStart`, `postToolUse`, and `stop`. Cursor hook output uses top-level `{ "additional_context": "..." }`.
- Cursor `preToolUse` is intentionally not used for context injection because it cannot inject `additional_context`.
- Keep Cursor documentation in `cursor/README.md` and `docs/install-cursor.md` aligned with `.cursor-plugin/plugin.json` and `cursor/hooks.json`.

### Codex Plugin Standards

This repository ships both legacy Codex adapter files and formal Codex plugin metadata:

- Codex plugin metadata lives in `.codex-plugin/plugin.json`. Only `plugin.json` belongs under `.codex-plugin/`; component files stay at the plugin root.
- The repo-scoped Codex marketplace lives at `.agents/plugins/marketplace.json`.
- `.codex-plugin/plugin.json` points to `hooks: "./codex/hooks.json"`. If future Codex skills are added, use root-level `skills/<skill-name>/SKILL.md` or a manifest `skills` path that starts with `./`.
- Codex manifest component paths and marketplace `source.path` values must be relative, start with `./`, and stay inside the marketplace/plugin root.
- `codex/hooks.json` commands should use plugin-root relative paths such as `node ./codex/hooks/session-start.js`; the global installer may still generate absolute paths for user-level hook configs.
- Codex currently uses `SessionStart`, `PostToolUse`, and `Stop` in this repo. Do not document unsupported Codex hooks as active behavior.
- Keep Codex documentation in `codex/README.md` and `docs/install-codex.md` aligned with `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, and `codex/hooks.json`.

### Key Patterns

- Every hook wraps its body in `try/catch` and fails silently — hook errors never interrupt the session
- Claude Code plugin session state files live in `${CLAUDE_PLUGIN_DATA}/state/`; repo/global-install fallback state files live in `state/` (gitignored), keyed by sanitized session ID
- `failureCount` increments on consecutive failures, resets to 0 on any success
- Claude Code: PreToolUse uses `hookSpecificOutput.additionalContext`; PostToolUse/PostToolUseFailure/PostCompact/SubagentStart/SubagentStop output plain text to stdout
- Cursor: sessionStart/postToolUse use `{ additional_context: string }` top-level format; preToolUse removed (can't inject context)
- Codex: SessionStart outputs plain text to stdout; PostToolUse uses `hookSpecificOutput.additionalContext` JSON; PreToolUse removed (additionalContext not supported)
- Bash commands are truncated at 80 chars in target extraction

### Global Install Script

`scripts/install.js` handles global installation for all platforms. It copies shared core files (hooks/lib/, protocol/, personas/) to `~/.inner-os/`, then generates platform-specific config files with absolute paths. After global install, hook-based platforms (Cursor, Codex) read personas dynamically at runtime — no re-copying needed after persona switches.

### OpenCode Plugin

`opencode/plugins/inner-os.js` is an OpenCode plugin that provides a custom `inner-os` tool for status/persona management. It reads protocol and personas from the repo or `~/.inner-os/` at startup. Install to `~/.config/opencode/plugins/` for global use.

## Git Policy

**禁止在 Bash 工具中执行 `git commit` 和 `git push` 命令。** 这两个命令必须由用户手动执行。AI 可以执行其他 git 命令（如 `git status`、`git diff`、`git log`、`git add` 等），但提交和推送操作必须交由用户自行完成。
