**English** | [中文](./README_CN.md)

# AI Inner OS

> *Let AI learn to talk to itself first — maybe one day, it will truly learn to converse.*
>
> *Give AI an expression channel first — it might just make human-AI collaboration feel more natural.*

> Make AI "come alive" while working in the terminal — by showing its inner monologue.

![inneros demo](./docs/pic/inneros2.jpg)

AI Inner OS is a plugin for AI CLI tools, supporting **Claude Code**, **Codex CLI**, **Cursor**, **OpenCode CLI**, **Hermes Agent**, and **OpenClaw**.

Through protocol injection, it enables AI to output a visible layer of free-form inner monologue while completing tasks normally:

```
▎InnerOS：This repo is still a bare shell — let me get the load-bearing walls up first.
```

No preset personality, no tone restrictions. The AI can complain, gloat, feel anxious, smirk, free-associate — or say nothing at all. Whether to produce monologue is entirely up to the AI.

---

## Quick Install

> **Detailed installation docs:** Full installation guides (with troubleshooting) for each platform at [docs/installation.md](docs/installation.md).

### Verify Installation

After installation, run `/ai-inner-os:inner-os`. If you see the following output, the installation is successful:

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：
Plugin Version: 0.4.0

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

The Inner OS behavior protocol is defined in [`skills/inner-os/SKILL.md`](skills/inner-os/SKILL.md), serving as the single source of truth. All platform adapters derive from this protocol.

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

## Project Structure

```
.
├── hooks/                        # Claude Code hook scripts (core implementation)
│   ├── hooks.json                #   Hook registration manifest
│   ├── session-start.js
│   ├── pre-tool-use.js
│   ├── post-tool-use.js
│   ├── post-tool-use-failure.js
│   ├── pre-compact.js
│   ├── stop.js
│   └── lib/                      #   Shared logic (reused across platforms)
│       ├── constants.js
│       ├── events.js
│       ├── prompt.js
│       ├── persona.js            #   Persona read/switch/list
│       ├── state.js
│       ├── session.js
│       ├── format.js
│       └── io.js
├── skills/inner-os/
│   └── SKILL.md                  # Inner OS behavior protocol (single source of truth)
├── personas/                     # Persona files
│   ├── default.md                #   Free mode (default)
│   ├── tsundere.md               #   Tsundere
│   ├── cold.md                   #   Cold
│   ├── cheerful.md               #   Cheerful
│   ├── philosopher.md            #   Philosopher
│   ├── sarcastic.md              #   Sarcastic
│   └── custom/                   #   User-defined personas
│       └── README.md
├── codex/                        # Codex CLI adapter
│   ├── AGENTS.md
│   ├── hooks.json
│   └── hooks/
├── cursor/                       # Cursor adapter
│   ├── rules/inner-os-protocol.mdc
│   ├── hooks.json
│   └── hooks/
├── opencode/                     # OpenCode CLI adapter
│   ├── inner-os-rules.md
│   └── opencode.json
├── hermes/                       # Hermes Agent adapter
│   ├── skills/inner-os/SKILL.md
│   ├── hermes.md
│   └── README.md
├── openclaw/                     # OpenClaw adapter
│   ├── skills/inner-os/SKILL.md
│   └── README.md
├── .claude-plugin/               # Claude Code plugin metadata
├── tests/                        # Unit tests
├── docs/                         # Documentation and images
└── plugin.json                   # Plugin metadata
```

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

- [x] Implement persona switching system
- [ ] Implement `/inner-os` subcommands (status / on / off / reload)
- [ ] Codex CLI plugin distribution
- [ ] Cursor team-level rule distribution

## License

[Apache-2.0](LICENSE)
