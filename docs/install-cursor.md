# Cursor 安装指南

在 [Cursor](https://cursor.com) 中安装 AI Inner OS。

## 前置条件

- Cursor IDE 已安装
- Node.js >= 18

## 安装步骤

### 方式一：全局安装脚本（推荐）

```bash
git clone https://github.com/SummerSec/AI-Inner-Os.git
cd AI-Inner-Os
node scripts/install.js --platform cursor
```

脚本会自动：
- 复制 hook 脚本和共享逻辑到 `~/.inner-os/`
- 生成 `~/.cursor/hooks.json`（带绝对路径）
- 复制所有预设人设文件

### 方式二：手动安装

**步骤 1：复制 `.mdc` 规则文件**

```bash
mkdir -p .cursor/rules
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

**步骤 2：配置 Hooks**

将 hooks 配置复制到用户级（全局）或项目级：

```bash
# 用户级（推荐，全局生效）
cp cursor/hooks.json ~/.cursor/hooks.json

# 或项目级
cp cursor/hooks.json .cursor/hooks.json
```

> **注意：** hooks.json 中的脚本路径使用相对路径，需要从仓库根目录执行 Cursor。全局安装脚本会自动生成绝对路径。

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

## 团队使用

如果你的团队都想使用 Inner OS，将 `.cursor/rules/inner-os-protocol.mdc` 提交到版本控制：

```bash
# 将规则文件加入 git
git add .cursor/rules/inner-os-protocol.mdc
git commit -m "feat: add Inner OS protocol for Cursor"
```

团队成员 pull 后自动生效。

## 人设切换（Persona）

切换人设需要完整克隆的仓库（包含 `personas/` 和 `scripts/` 目录）。

**第一步：在仓库中切换**

```bash
cd /path/to/AI-Inner-Os
node scripts/switch-persona.js sarcastic   # 切换到指定人设
node scripts/switch-persona.js default     # 恢复自由模式
node scripts/switch-persona.js --list      # 列出所有可用人设
```

**第二步：重新复制到安装位置**

```bash
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

> **提示：** 每次切换人设后都需要重新复制规则文件。

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
