# Cursor 安装指南

在 [Cursor](https://cursor.com) 中安装 AI Inner OS。

## 安装策略

正式用户只推荐通过 Cursor plugin / marketplace 安装。这样 `.cursor-plugin/plugin.json` 的 `version` 更新后，Cursor 才能通过插件缓存识别新版内容。

`node scripts/install.js --platform cursor`、手动复制 `.mdc`、手动复制 `hooks.json` 仅用于本仓库开发和本地调试，不作为正式安装路径。

## 安装步骤

仓库根目录包含 Cursor 插件清单：

```text
.cursor-plugin/plugin.json
```

清单直接引用现有 `cursor/` 目录：

```json
{
  "rules": "./cursor/rules/",
  "hooks": "./cursor/hooks.json"
}
```

这种布局让 `cursor/` 同时作为 Cursor 适配源码和插件组件目录。发布时 bump `.cursor-plugin/plugin.json` 与 `.cursor-plugin/marketplace.json` 中的版本号，用户通过 Cursor plugin / marketplace 获取更新。

## 安装后验证

1. 在 Cursor 中打开项目
2. 开始一个新的 AI 对话
3. AI 应在回复中自然出现 `▎InnerOS：...` 独白
4. 检查插件版本是否为最新发布版本

## `.mdc` 规则文件格式

```markdown
---
description: "AI Inner OS: 允许 AI 输出 ▎InnerOS：... 格式的内心独白"
alwaysApply: true
---

# AI Inner OS

（协议内容）
```

- `description`：规则的简短描述
- `alwaysApply: true`：每次对话自动加载，无需手动激活

## Hook 说明

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `sessionStart` | 会话启动 | 读取协议 + 当前人设，注入 `additional_context` |
| `postToolUse` | 工具执行成功后 | 追踪事件，注入最近活动上下文 |
| `stop` | 会话结束 | 清理会话状态文件 |

> **注意：** Cursor 的 `preToolUse` 不支持注入 `additional_context`（仅支持 allow/deny），因此未使用。协议注入通过 `sessionStart` 完成。

## 文件说明

| 文件 | 作用 |
|------|------|
| `cursor/rules/inner-os-protocol.mdc` | Cursor 规则文件（`alwaysApply: true`，静态备用） |
| `cursor/hooks.json` | Hook 注册配置（`sessionStart` + `postToolUse` + `stop`） |
| `cursor/hooks/session-start.js` | 会话启动时注入协议和人设 |
| `cursor/hooks/post-tool-use.js` | 工具执行后追踪事件 |
| `cursor/hooks/stop.js` | 会话结束清理状态 |

## 人设切换（Persona）

正式安装场景下，人设与频率应由插件配置或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本，不作为用户安装流程。

## 故障排查

### 规则不生效

1. 确认 Cursor 已安装并启用 `ai-inner-os` 插件
2. 确认插件版本是最新发布版本
3. 重新打开项目或开始新对话

### 与其他规则冲突

Inner OS 规则只添加独白能力，不修改其他行为。如果与其他 `.mdc` 规则冲突，检查是否有重复的 `# AI Inner OS` 标题或协议内容。

### 协议更新

协议更新通过 Cursor plugin / marketplace 发布。不要通过手动复制规则文件作为用户更新方式。
