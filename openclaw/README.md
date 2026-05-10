# OpenClaw 适配

在 [OpenClaw](https://github.com/openclaw/openclaw) 中启用 AI Inner OS。

## 安装

正式用户只通过 OpenClaw plugin / ClawHub 安装。手动复制 Skill 仅用于本仓库开发调试，不作为正式安装或更新路径。

```bash
openclaw plugins install clawhub:ai-inner-os
openclaw plugins inspect ai-inner-os --runtime --json
```

本地开发时可从仓库根目录安装：

```bash
openclaw plugins install .
```

## 工作原理

插件入口 `openclaw/index.js` 使用 `definePluginEntry`，注册 `before_prompt_build` 和 `llm_output` hook，并将 `▎InnerOS：` 独白写入 `~/.inner-os/monologues/`。

| 机制 | 文件 | 作用 |
|------|------|------|
| Plugin manifest | `openclaw.plugin.json` | 声明插件身份、配置 schema、skills |
| Plugin entry | `openclaw/index.js` | 注册 OpenClaw hooks |
| Skill | `openclaw/skills/inner-os/SKILL.md` | 随插件分发的 AgentSkills 内容 |

## 配置

```json5
{
  plugins: {
    entries: {
      "ai-inner-os": {
        config: {
          frequency: "high"
        }
      }
    }
  }
}
```

## Persona（人设切换）

正式安装场景下，人设与频率应由 OpenClaw 插件配置或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent | OpenClaw |
|---|---|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | SessionStart Hook | `.mdc` 规则 + hook | Plugin package | Plugin hook | Plugin hook + Skill |
| Hook 支持 | 9 个 | 3 个 | 3 个 | Plugin API | Python plugin hooks | OpenClaw plugin hooks |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 | 不支持 | 不支持 |
| 安装方式 | Marketplace | Plugin / marketplace | Plugin / marketplace | Plugin package | Plugin | Plugin / ClawHub |
| 斜杠命令 | `/inner-os` | 无 | 无 | `inner-os` tool | `/inner-os` | `/inner-os` |
