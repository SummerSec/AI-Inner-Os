# Cursor 插件

在 [Cursor](https://cursor.com) 中启用 AI Inner OS。当前仓库采用“方案 B”：`cursor/` 目录既是 Cursor 适配源码，也是 `.cursor-plugin/plugin.json` 声明的插件组件目录。

## 插件结构

| 文件 | 作用 |
|------|------|
| `.cursor-plugin/plugin.json` | Cursor 插件清单，声明规则与 hooks 路径 |
| `.cursor-plugin/marketplace.json` | Cursor marketplace 元数据入口 |
| `cursor/rules/inner-os-protocol.mdc` | `alwaysApply` 规则，静态注入 Inner OS 协议 |
| `cursor/hooks.json` | Hook 注册配置 |
| `cursor/hooks/session-start.js` | 会话启动时读取协议和当前人设，注入 `additional_context` |
| `cursor/hooks/post-tool-use.js` | 工具执行后记录事件，注入最近活动上下文 |
| `cursor/hooks/stop.js` | 会话结束时清理状态 |

## 安装

### 方式一：Cursor 插件清单

仓库根目录包含 `.cursor-plugin/plugin.json`，清单直接引用 `cursor/` 下的规则和 hooks：

```json
{
  "rules": "./cursor/rules/",
  "hooks": "./cursor/hooks.json"
}
```

用于 Cursor 插件分发或本地插件加载时，不需要再把 `cursor/` 拆成单独目录。

### 方式二：全局安装脚本

如果只想在当前机器全局启用：

```bash
node scripts/install.js --platform cursor
```

脚本会把运行时文件复制到 `~/.inner-os/`，并将 hooks 合并写入 `~/.cursor/hooks.json`，不会覆盖已有 hook 配置。

### 方式三：仅使用项目规则

如果只需要静态协议注入，可以把规则复制到目标项目：

```bash
mkdir -p .cursor/rules
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

## 工作原理

Cursor 侧有两层能力：

- `.mdc` 规则：始终加载 Inner OS 协议，是最稳定的兜底机制。
- hooks：在 `sessionStart` 注入动态协议和当前人设，在 `postToolUse` 注入最近工具事件，在 `stop` 清理会话状态。

Cursor 的 `preToolUse` 不支持注入 `additional_context`，所以没有使用工具执行前 hook。

## Persona（人设切换）

通过全局安装脚本启用 hooks 后，Cursor 会在 `sessionStart` 读取 `~/.inner-os/personas/_active.json` 和对应人设文件。切换方式：

```bash
node ~/.inner-os/scripts/switch-persona.js --list
node ~/.inner-os/scripts/switch-persona.js sarcastic
node ~/.inner-os/scripts/switch-persona.js default
```

如果只复制 `.mdc` 规则而不启用 hooks，则需要把 `personas/<name>.md` 的正文手动追加到 `cursor/rules/inner-os-protocol.mdc` 的 persona 标记区。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor |
|---|---|---|---|
| 协议注入 | SessionStart hook 读取 SKILL.md | SessionStart hook / AGENTS.md | `.mdc` 规则 + `sessionStart` hook |
| Hook 数量 | 6 个 | 3 个 | 3 个 |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 |
| 安装方式 | 插件市场一键安装 | `install.js` 全局安装 | Cursor 插件清单 / `install.js` 全局安装 |
