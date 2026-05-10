# Codex 适配

在 [OpenAI Codex CLI](https://github.com/openai/codex) 中启用 AI Inner OS。

## 安装

正式用户只通过 Codex plugin / marketplace 安装。手动适配、全局脚本、手动复制 `AGENTS.md` 或 `hooks.json` 仅用于本仓库开发调试。

仓库根目录包含正式 Codex 插件清单：

```text
.codex-plugin/plugin.json
```

清单直接引用现有 Codex hook 配置：

```json
{
  "hooks": "./codex/hooks.json"
}
```

仓库还包含 repo-scoped marketplace：

```text
.agents/plugins/marketplace.json
```

Codex 可从该 marketplace 发现 `ai-inner-os`，并从当前仓库根目录加载插件组件。

## Hook 生命周期

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动 | 初始化会话状态 |
| `PostToolUse` | 工具执行后 | 追踪事件，注入最近活动上下文 |
| `Stop` | 会话结束 | 清理状态文件 |

## Persona（人设切换）

正式安装场景下，人设与频率应由插件配置或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 与 Claude Code 版本的差异

| | Claude Code | Codex CLI |
|---|---|---|
| 协议注入 | SessionStart hook 自动读取 SKILL.md | AGENTS.md 静态加载 |
| 失败追踪 | PostToolUseFailure 独立 hook | 无（Codex 暂不支持） |
| Hook 数量 | 9 个 | 3 个 |
| 安装方式 | 插件市场一键安装 | Codex plugin / marketplace |
