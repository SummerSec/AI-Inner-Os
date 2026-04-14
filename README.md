**English** | [中文](./README_CN.md)

<h1 align="center">AI Inner OS</h1>
<h3 align="center">Make AI "come alive" while working in the terminal — by showing its inner monologue.</h3>
<p align="center">
  <a href="https://github.com/SummerSec/AI-Inner-Os"><img alt="AI-Inner-Os" src="https://img.shields.io/badge/AI--Inner--Os-plugin-blue"></a>
  <a href="https://github.com/SummerSec/AI-Inner-Os/releases"><img alt="Release" src="https://img.shields.io/github/release/SummerSec/AI-Inner-Os.svg"></a>
  <a href="https://github.com/SummerSec/AI-Inner-Os"><img alt="Stars" src="https://img.shields.io/github/stars/SummerSec/AI-Inner-Os.svg?style=social&label=Stars"></a>
  <a href="https://github.com/SummerSec/AI-Inner-Os"><img alt="Forks" src="https://img.shields.io/github/forks/SummerSec/AI-Inner-Os"></a>
  <a href="https://github.com/SummerSec"><img alt="Follow" src="https://img.shields.io/github/followers/SummerSec.svg?style=social&label=Follow"></a>
  <a href="https://github.com/SummerSec/AI-Inner-Os"><img alt="Visitor" src="https://visitor-badge.laobi.icu/badge?page_id=SummerSec.AI-Inner-Os"></a>
</p>

> *Let AI learn to talk to itself first — maybe one day, it will truly learn to converse.*
>
> *Give AI an expression channel first — it might just make human-AI collaboration feel more natural.*

![inneros demo](./docs/pic/inneros2.jpg)

<details>
<summary>Watch demo video</summary>

<video controls playsinline preload="metadata" width="100%" style="max-width:720px" src="https://raw.githubusercontent.com/SummerSec/BlogPapers/master/resources/video.mp4"></video>

If the player does not load here, open the file directly: [demo (MP4)](https://raw.githubusercontent.com/SummerSec/BlogPapers/master/resources/video.mp4) · [on GitHub](https://github.com/SummerSec/BlogPapers/blob/master/resources/video.mp4)

</details>

AI Inner OS is a plugin for AI CLI tools, supporting **Claude Code**, **Codex CLI**, **Cursor**, **OpenCode CLI**, **Hermes Agent**, and **OpenClaw**.

Through protocol injection, it enables AI to output a visible layer of free-form inner monologue while completing tasks normally:

```
▎InnerOS：This repo is still a bare shell — let me get the load-bearing walls up first.
```

Free mode by default, no tone restrictions. The AI can complain, gloat, feel anxious, smirk, free-associate — or say nothing at all. You can also switch to preset personas (tsundere, cold, philosopher, etc.) to give the monologue a specific style. Whether to produce monologue is entirely up to the AI.

---

## Quick Install

> **Detailed installation docs:** Full installation guides (with troubleshooting) for each platform at [docs/installation.md](docs/installation.md).

### For AI Agents

Paste the following prompt to let your AI agent install AI Inner OS automatically:

```
Read https://raw.githubusercontent.com/SummerSec/AI-Inner-Os/refs/heads/main/docs/installation.md 安装 AI-Inner-Os
```

### Verify Installation

After installation, run `/ai-inner-os:inner-os`. If you see the following output, the installation is successful:

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：
Plugin Version: 0.5.0

▎InnerOS：Caught with the wrong version number, embarrassing.
```

### Claude Code (Recommended)

```
# GitHub short format
/plugin marketplace add SummerSec/AI-Inner-Os

# Or Git URL format
/plugin marketplace add https://github.com/SummerSec/AI-Inner-Os.git

# Install and activate
/plugin install ai-inner-os
/reload-plugins
```

Run `/reload-plugins` after installation to activate in the current session — no restart needed. [Detailed installation guide](docs/install-claude-code.md).

> **Enable auto-update:** Third-party marketplaces don't auto-update by default. After installation, enable auto-update for `SummerSec/AI-Inner-Os` in `/plugin` → Marketplaces tab, or manually run:
> ```
> /plugin marketplace update SummerSec/AI-Inner-Os
> /plugin update ai-inner-os
> ```

### Codex CLI

```bash
# Inject protocol into global or project-level AGENTS.md
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# Configure hooks
cp codex/hooks.json ~/.codex/hooks.json
```

See [codex/README.md](codex/README.md) | [Detailed installation guide](docs/install-codex.md).

### Cursor

```bash
# Copy rule file to project
mkdir -p .cursor/rules
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

See [cursor/README.md](cursor/README.md) | [Detailed installation guide](docs/install-cursor.md).

### OpenCode CLI

```bash
# Copy instruction file
mkdir -p .opencode
cp opencode/inner-os-rules.md .opencode/

# Add instructions to opencode.json
cp opencode/opencode.json ./opencode.json
```

See [opencode/README.md](opencode/README.md) | [Detailed installation guide](docs/install-opencode.md).

### Hermes Agent

```bash
# Option 1: Install as Skill (recommended, enables /inner-os command)
cp -r hermes/skills/inner-os ~/.hermes/skills/personality/inner-os

# Option 2: Project-level Context File
cp hermes/hermes.md ./.hermes.md
```

See [hermes/README.md](hermes/README.md) | [Detailed installation guide](docs/install-hermes.md).

### OpenClaw

```bash
# Option 1: Install as Workspace Skill (recommended, enables /inner-os command)
mkdir -p skills
cp -r openclaw/skills/inner-os skills/inner-os

# Option 2: Global Skill
cp -r openclaw/skills/inner-os ~/.openclaw/skills/inner-os
```

See [openclaw/README.md](openclaw/README.md) | [Detailed installation guide](docs/install-openclaw.md).

---

## Persona Switching

Inner OS supports setting character personalities and tones for inner monologue. Personas only affect the `▎InnerOS：` prefixed monologue content — they don't affect main task responses.

### Preset Personas

| Name | Display Name | Style |
|------|-------------|-------|
| default | Free Mode | No fixed persona, free expression |
| tsundere | Tsundere | Tough on the outside, soft inside; snarky; "it's not like I did it for you" |
| cold | Cold | Minimalist, to the point, no wasted words |
| cheerful | Cheerful | Positive, encouraging, occasionally over-enthusiastic |
| philosopher | Philosopher | Deep, metaphorical, everything becomes philosophy |
| sarcastic | Sarcastic | Sharp-tongued, hits the nail on the head, no mercy |

### Switching Commands (Claude Code)

```
/inner-os persona list          # List all available personas
/inner-os persona use tsundere  # Switch to tsundere mode
/inner-os persona show          # Show current persona
/inner-os persona reset         # Reset to free mode
```

### Custom Personas

Create `.md` files in the `personas/custom/` directory to add custom personas. See [personas/custom/README.md](personas/custom/README.md).

### Other Platforms

- **Codex CLI:** Manually edit `personas/_active.json`, set `persona` to the target persona name
- **Cursor:** Manually append the body content of `personas/<name>.md` to the `.mdc` rule file
- **OpenCode:** Manually append the body content of `personas/<name>.md` to `inner-os-rules.md`

---

## Protocol Design

The Inner OS behavior protocol is defined in [`protocol/SKILL.md`](protocol/SKILL.md), serving as the single source of truth. All platform adapters derive from this protocol.

Core principles:

- **Main task first** — Monologue cannot replace actual deliverables
- **Monologue is optional** — Whether to output is decided by the AI
- **Unified format** — Uses the `▎InnerOS：` prefix
- **Switchable persona** — Define monologue style through persona files

---

## Multi-Platform Support

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent | OpenClaw |
|---|---|---|---|---|---|---|
| Protocol Injection | Hook reads SKILL.md dynamically | AGENTS.md | `.mdc` rule | instructions file | Skill or `.hermes.md` | Skill (AgentSkills format) |
| Pre-tool hook | `PreToolUse` | `PreToolUse` | `beforeToolUse` | — | — | — |
| Post-tool hook | `PostToolUse` | `PostToolUse` | `afterToolUse` | — | — | — |
| Failure tracking | `PostToolUseFailure` | — | — | — | — | — |
| Persona switching | `/inner-os persona` command | Edit `_active.json` manually | Append to rule file | Append to instruction file | Append manually | Append manually |
| Installation | Plugin marketplace one-click | Manual config copy | Copy .mdc rule | Copy instruction file | Copy Skill or Context File | Copy Skill or ClawHub |
| Shared logic | `hooks/lib/` (canonical) | Reuses `hooks/lib/` | Reuses `hooks/lib/` | Static injection only | Static injection only | Static injection only |

### Claude Code Hook Lifecycle

Claude Code has the most complete hook support:

```
SessionStart → Inject Inner OS protocol + persona
                 ↓
PreToolUse → Tool execution → PostToolUse (success)
                             → PostToolUseFailure (failure)
                 ↓
PreCompact → Save state
                 ↓
Stop → Clean up state
```

| Hook | Trigger | Purpose |
|------|---------|---------|
| `SessionStart` | Session start/resume/compact | Read protocol from SKILL.md, append current persona, inject |
| `PreToolUse` | Before tool execution | Inject tool context (name, target, retry hints) |
| `PostToolUse` | After successful execution | Track events, inject recent activity context |
| `PostToolUseFailure` | After failed execution | Track failures, inject error context and consecutive failure count |
| `PreCompact` | Before context compaction | Save state, maintain protocol continuity |
| `Stop` | Session end | Clean up state files |

---

## Development

```bash
# Syntax check
npm run check

# Run tests
npm test
```

Node.js >= 18, ESM modules.

## Roadmap

### Done

- [x] Implement persona switching system

### In Progress

- [ ] Implement `/inner-os` subcommands (status / on / off / reload)
- [ ] Codex CLI plugin distribution
- [ ] Cursor team-level rule distribution

### Phase 1: Personalized Style — Train Your AI With Your AI

- [ ] Monologue export — persist all `▎InnerOS：` outputs to structured log files
- [ ] Expression fingerprint extraction — analyze accumulated monologue data to identify unique style patterns
- [ ] Custom style model training — let users fine-tune a "monologue personality layer" from exported data
- [ ] Cross-session impression memory — store per-repo key impressions (repo fingerprint + short summary), enabling "déjà vu" across sessions

### Phase 2: Self-Awareness — Achievement System & Anomaly Narration

- [ ] Achievement system — track session milestones (first edit, 100th tool call, midnight coding, streak records) and announce via monologue
- [ ] Anomaly narration — detect abnormal patterns (repeated edits to same file, consecutive failures exceeding threshold, sudden directory jumps) and narrate them as monologue
- [ ] Session statistics — track tool call counts, success/failure ratios, active duration per session

### Phase 3: Emotional State Machine & Session Diary

- [ ] Mood system — introduce emotion state machine in `state.json` that evolves based on session events (consecutive failures → frustrated → anxious; bug fix → confident → relieved; idle → bored → curious)
- [ ] Mood × Persona interaction — mood affects monologue tone without overriding persona (same emotion, different personality, different expression)
- [ ] Session recap — generate narrative session summaries on session end, including emotional arc, key events, and duration
- [ ] Session diary persistence — save recaps as Markdown files to serve as development journals with emotional context

## Star History

[![Star History Chart](https://starchart.cc/SummerSec/AI-Inner-Os.svg)](https://starchart.cc/SummerSec/AI-Inner-Os)

## License

[Apache-2.0](LICENSE)
