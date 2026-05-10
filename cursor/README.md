# Cursor 插件

在 [Cursor](https://cursor.com) 中启用 AI Inner OS。当前仓库采用“方案 B”：`cursor/` 目录既是 Cursor 适配源码，也是 `.cursor-plugin/plugin.json` 声明的插件组件目录。

## 插件结构

| 文件 | 作用 |
|------|------|
| `.cursor-plugin/plugin.json` | Cursor 插件清单，声明规则与 hooks 路径 |
| `.cursor-plugin/marketplace.json` | Cursor marketplace 元数据入口 |
| `cursor/rules/inner-os-protocol.mdc` | `alwaysApply` 规则，静态注入 Inner OS 协议 |
| `cursor/skills/` | Cursor skills，包括可选用户画像和历史查询 |
| `cursor/hooks.json` | Hook 注册配置 |
| `cursor/hooks/session-start.js` | 会话启动时读取协议和当前人设，注入 `additional_context` |
| `cursor/hooks/post-tool-use.js` | 工具执行后记录事件，注入最近活动上下文 |
| `cursor/hooks/stop.js` | 会话结束时清理状态 |

## 安装

正式用户只通过 Cursor plugin / marketplace 安装。全局脚本和手动复制 `.mdc` / `hooks.json` 仅用于本仓库开发调试，不作为正式安装或更新路径。

仓库根目录包含 `.cursor-plugin/plugin.json`，清单直接引用 `cursor/` 下的规则和 hooks：

```json
{
  "rules": "./cursor/rules/",
  "skills": "./cursor/skills/",
  "hooks": "./cursor/hooks.json"
}
```

用于 Cursor 插件分发或本地插件加载时，不需要再把 `cursor/` 拆成单独目录。发布更新时 bump `.cursor-plugin/plugin.json` 和 `.cursor-plugin/marketplace.json` 的版本号。

## 工作原理

Cursor 侧有两层能力：

- `.mdc` 规则：始终加载 Inner OS 协议，是最稳定的兜底机制。
- hooks：在 `sessionStart` 注入动态协议和当前人设，在 `postToolUse` 注入最近工具事件，在 `stop` 清理会话状态。

Cursor 的 `preToolUse` 不支持注入 `additional_context`，所以没有使用工具执行前 hook。

## Persona（人设切换）

正式安装场景下，人设与频率应由插件配置或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 可选用户人物画像

`cursor/skills/user-profile-distillation` 默认不自动触发。只有用户明确请求画像分析时才使用；如需读取历史，必须先确认日期范围和来源，并复用 `agent-chat-history` 只读查询。持续进化模式也需显式开启，只在当前对话中维护版本化画像。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor |
|---|---|---|---|
| 协议注入 | SessionStart hook 读取 SKILL.md | SessionStart hook / AGENTS.md | `.mdc` 规则 + `sessionStart` hook |
| Hook 数量 | 9 个 | 3 个 | 3 个 |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 |
| 安装方式 | 插件市场一键安装 | Codex plugin / marketplace | Cursor plugin / marketplace |
