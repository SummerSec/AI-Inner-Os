# Cursor 安装指南

在 [Cursor](https://cursor.com) 中安装 AI Inner OS。

## 前置条件

- Cursor IDE 已安装
- 一个打开的项目目录

## 安装步骤

### 方式一：`.mdc` 规则文件（推荐）

Cursor 使用 `.mdc`（Markdown Configuration）规则文件来注入行为指令。

```bash
# 创建规则目录
mkdir -p .cursor/rules

# 复制 Inner OS 规则
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

规则文件设置了 `alwaysApply: true`，每次对话自动生效，无需手动触发。

### 方式二：追加到 AGENTS.md

如果你的项目使用 `AGENTS.md` 管理指令：

```bash
# 追加 Inner OS 协议
cat cursor/rules/inner-os-protocol.mdc >> AGENTS.md
```

### 可选：启用 Hooks

Cursor 支持有限的 hook 机制。如需工具执行上下文追踪：

```bash
# 复制 hooks 配置
cp cursor/hooks.json .cursor/hooks.json
```

> **注意：** Hook 脚本路径需要指向本仓库的实际位置。你可以：
> - 使用绝对路径指向克隆的仓库
> - 将 `cursor/hooks/` 和 `hooks/lib/` 复制到项目中

```bash
# 方式 A：复制到项目中
cp -r cursor/hooks/ .cursor/inner-os-hooks/
mkdir -p .cursor/inner-os-hooks/lib
cp -r hooks/lib/* .cursor/inner-os-hooks/lib/
# 然后更新 hooks.json 中的路径
```

## 安装后验证

1. 在 Cursor 中打开项目
2. 开始一个新的 AI 对话
3. AI 应在回复中自然出现 `▎InnerOS：...` 独白
4. 检查 `.cursor/rules/` 目录确认规则文件存在

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

## Hook 说明（可选）

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `beforeToolUse` | 工具执行前 | 注入即将执行的工具上下文 |
| `afterToolUse` | 工具执行后 | 追踪事件，注入最近活动上下文 |

Cursor 中 `.mdc` 规则是主要注入机制，hooks 只是可选增强。即使不配置 hooks，Inner OS 独白功能也能正常工作。

## 文件说明

| 文件 | 作用 |
|------|------|
| `cursor/rules/inner-os-protocol.mdc` | Cursor 规则文件（`alwaysApply: true`） |
| `cursor/hooks.json` | Hook 注册配置（可选） |
| `cursor/hooks/before-tool-use.js` | 工具执行前上下文（可选） |
| `cursor/hooks/after-tool-use.js` | 工具执行后追踪（可选） |

## 团队使用

如果你的团队都想使用 Inner OS，将 `.cursor/rules/inner-os-protocol.mdc` 提交到版本控制：

```bash
# 将规则文件加入 git
git add .cursor/rules/inner-os-protocol.mdc
git commit -m "feat: add Inner OS protocol for Cursor"
```

团队成员 pull 后自动生效。

## 故障排查

### 规则不生效

1. 确认文件位于 `.cursor/rules/` 目录下
2. 确认 frontmatter 中 `alwaysApply: true` 设置正确
3. 重新打开项目或开始新对话

### 与其他规则冲突

Inner OS 规则只添加独白能力，不修改其他行为。如果与其他 `.mdc` 规则冲突，检查是否有重复的 `# AI Inner OS` 标题或协议内容。

### 协议更新

当上游更新后：

```bash
# 重新复制规则文件
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```
