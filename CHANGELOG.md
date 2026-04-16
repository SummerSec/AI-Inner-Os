# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.1] - 2026-04-16

### Fixed

- **Release workflow**: Migrate from deprecated `actions/create-release@v1` to `softprops/action-gh-release@v2`; add `permissions: contents: write` to fix "Resource not accessible by integration" error.
- **Install**: Global installer no longer overwrites user config files (respects existing configurations).

## [0.7.0] - 2026-04-16

### Added

- GitHub Actions release workflow for tag-based releases with automatic CHANGELOG parsing.

## [0.6.1] - 2026-04-16

### Fixed

- **Install**: Global installer no longer overwrites user config files (respects existing configurations).

## [0.6.0] - 2026-04-15

### Added

- OpenCode adapter: `opencode/plugins/inner-os.js` plugin with a custom `inner-os` tool for status and persona management.
- Global installer `scripts/install.js` for one-command setup across platforms, including persona files under `~/.inner-os/`.
- Script-driven persona switching across all hook-based platforms (`scripts/switch-persona.js`, extended `npm run check` coverage).

### Fixed

- **Cursor**: `hooks.json` aligned with supported events (`sessionStart` / `postToolUse` / `stop`); protocol injection via `session-start.js`; output uses `additional_context`; removed unsupported `preToolUse`.
- **Codex**: `hooks.json` uses nested matcher format; protocol on `SessionStart`; `PostToolUse` emits JSON `additionalContext`; removed unsupported `PreToolUse`; session end hook naming aligned with Codex.
- Persona frontmatter parsing with CRLF line endings in `personas/*.md` (Windows checkouts): `scripts/switch-persona.js` and `hooks/lib/persona.js`.
- `.claude-plugin/marketplace.json` plugin `version` field synced to 0.6.0 (was 0.5.0 on main).

### Changed

- Documentation: refreshed English/Chinese READMEs, installation guides (persona switching, platform examples, agent install URLs), badges, collapsible demo video, and star history chart.
- Demo video hosting and README embed updates.

### Removed

- Large in-repo marketing assets: standalone article and infographic images under `docs/` (replaced by leaner README-focused docs).

## [0.5.0] - 2026-04-14

### Added

- Persona system: preset personas, custom template, `/inner-os` command updates, and persona sections in platform adapter docs.

[0.7.1]: https://github.com/SummerSec/AI-Inner-Os/releases/tag/v0.7.1
[0.7.0]: https://github.com/SummerSec/AI-Inner-Os/releases/tag/v0.7.0
[0.6.1]: https://github.com/SummerSec/AI-Inner-Os/releases/tag/v0.6.1
[0.6.0]: https://github.com/SummerSec/AI-Inner-Os/releases/tag/v0.6.0
