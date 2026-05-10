# Hermes Agent 适配

在 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 中启用 AI Inner OS。

## 安装

正式用户只通过 Hermes plugin 安装。手动复制 Skill 或 `.hermes.md` 仅用于本仓库开发调试，不作为正式安装或更新路径。

```bash
mkdir -p ~/.hermes/plugins
cp -r hermes/plugins/inner-os ~/.hermes/plugins/inner-os
hermes plugins enable inner-os
```

项目级插件也可放到 `.hermes/plugins/inner-os/`，但需要显式启用可信项目插件：

```bash
HERMES_ENABLE_PROJECT_PLUGINS=true hermes
```

## 工作原理

Hermes 插件注册 `pre_llm_call` hook、`on_session_start` hook、`/inner-os` slash command，以及只读 bundled skill `plugin:inner-os`。

| 机制 | 文件 | 作用 |
|------|------|------|
| Plugin | `hermes/plugins/inner-os/plugin.yaml` + `__init__.py` | 注册 Hermes hooks、slash command、bundled skill |
| Standalone Skill | `hermes/skills/inner-os/SKILL.md` | 开发用 skill 副本 |
| Context File | `hermes/hermes.md` | 开发用 context file 副本 |

## Persona（人设切换）

正式安装场景下，人设与频率应由 Hermes 插件配置、环境变量或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent |
|---|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | SessionStart Hook | `.mdc` 规则 + hook | Plugin package | Plugin hook |
| Hook 支持 | 9 个 | 3 个 | 3 个 | Plugin API | Python plugin hooks |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 | 不支持 |
| 安装方式 | Marketplace | Plugin / marketplace | Plugin / marketplace | Plugin package | Plugin |
| 斜杠命令 | `/inner-os` | 无 | 无 | `inner-os` tool | `/inner-os` |
