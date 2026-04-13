# Cursor 适配

在 [Cursor](https://cursor.com) 中启用 AI Inner OS。

## 安装

### 方式一：.mdc 规则（推荐）

将规则文件复制到项目的 `.cursor/rules/` 目录：

```bash
mkdir -p .cursor/rules
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

规则设置了 `alwaysApply: true`，每次对话自动生效。

### 方式二：AGENTS.md

如果你的项目已有 AGENTS.md，将协议追加进去：

```bash
cat cursor/rules/inner-os-protocol.mdc >> AGENTS.md
```

### 可选：启用 hooks

如果需要工具执行前后的上下文追踪，配置 hooks：

```bash
cp cursor/hooks.json .cursor/hooks.json
```

> 注意：hook 脚本路径需要调整为本仓库的实际位置，或将 `cursor/hooks/` 和 `hooks/lib/` 复制到项目中。

## 工作原理

| 机制 | 文件 | 作用 |
|------|------|------|
| `.mdc` 规则 | `inner-os-protocol.mdc` | 每次对话自动注入 Inner OS 协议 |
| `beforeToolUse` hook | `before-tool-use.js` | 工具执行前注入上下文（可选） |
| `afterToolUse` hook | `after-tool-use.js` | 工具执行后追踪事件（可选） |

Cursor 中 `.mdc` 规则是主要注入机制，hooks 是可选增强。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor |
|---|---|---|---|
| 协议注入 | SessionStart hook 读取 SKILL.md | AGENTS.md 静态加载 | `.mdc` 规则 alwaysApply |
| Hook 数量 | 6 个 | 4 个 | 2 个（+ 规则兜底） |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 |
| 安装方式 | 插件市场一键安装 | 手动复制配置 | 复制 .mdc 到 .cursor/rules/ |
