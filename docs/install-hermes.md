# Hermes Agent 安装指南

在 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 中安装 AI Inner OS。

## 前置条件

- Hermes Agent 已安装并运行
- `~/.hermes/` 目录已初始化

## 安装方式

### 方式一：Skill 安装（默认）

将 Inner OS 安装为 Hermes 技能，获得 `/inner-os` 斜杠命令支持。

```bash
# 创建目标目录
mkdir -p ~/.hermes/skills/personality/inner-os

# 复制技能文件
cp hermes/skills/inner-os/SKILL.md ~/.hermes/skills/personality/inner-os/SKILL.md
```

安装后在会话中使用：

```
/inner-os
```

或通过自然语言调用：

```bash
hermes chat --toolsets skills -q "启用 inner-os 技能"
```

### 方式二：外部目录引用

避免复制文件，直接引用仓库中的技能目录：

```yaml
# ~/.hermes/config.yaml
skills:
  external_dirs:
    - /path/to/AI-Inner-Os/hermes/skills
```

外部目录是只读的——agent 创建或编辑的技能仍然写入 `~/.hermes/skills/`。本地技能同名时优先级更高。

### 方式三：Context File（项目级）

将 Inner OS 协议作为项目上下文文件注入：

```bash
# 复制到项目根目录
cp hermes/hermes.md ./.hermes.md
```

Hermes 启动时自动发现并加载 `.hermes.md`（优先级最高的项目上下文文件）。

> **注意：** `.hermes.md` 和 `HERMES.md` 效果相同，Hermes 优先查找这两个文件，其次是 `AGENTS.md`、`CLAUDE.md`、`.cursorrules`。

## 安装后验证

### Skill 方式

```bash
# 检查技能是否被发现
hermes chat --toolsets skills -q "你有哪些技能？"

# 或直接触发
/inner-os
```

### Context File 方式

1. 在项目目录启动 Hermes 会话
2. AI 应自然输出 `▎InnerOS：...` 独白

## 工作原理

### Skill 模式

Hermes 技能使用渐进式加载（Progressive Disclosure）来节省 token：

| 层级 | 调用 | 返回内容 | Token 消耗 |
|------|------|---------|-----------|
| 0 | `skills_list()` | 名称 + 描述 | ~3k tokens（全部技能） |
| 1 | `skill_view("inner-os")` | 完整 SKILL.md | 按需 |
| 2 | `skill_view("inner-os", path)` | 附属文件 | 按需 |

Agent 只在实际需要时才加载完整内容。

### Context File 模式

`.hermes.md` 在每次会话启动时注入系统 prompt，每轮都占用 context。适合需要每次对话都自动启用的场景。

### Skill vs Context File 对比

| | Skill | Context File |
|---|---|---|
| 加载方式 | 按需（slash command 或 agent 自行调用） | 每次会话自动加载 |
| Token 消耗 | 渐进式，仅在需要时注入 | 每轮都占用 context |
| 适用场景 | 全局启用，跨项目 | 单项目绑定 |
| 安装位置 | `~/.hermes/skills/` | 项目根目录 `.hermes.md` |
| 斜杠命令 | `/inner-os` | 无 |

## SKILL.md 格式说明

Hermes 技能使用 AgentSkills 兼容格式，扩展了 YAML frontmatter：

```yaml
---
name: inner-os
description: Expose the AI's visible inner monologue...
version: 0.5.0
metadata:
  hermes:
    tags: [personality, monologue, inner-voice, creative]
    category: personality
---
```

| 字段 | 作用 |
|------|------|
| `name` | 技能标识符 |
| `description` | 功能描述 |
| `version` | 语义化版本号 |
| `metadata.hermes.tags` | 分类标签 |
| `metadata.hermes.category` | 技能分类（决定目录位置） |

## 文件说明

| 文件 | 作用 |
|------|------|
| `hermes/skills/inner-os/SKILL.md` | Hermes 兼容技能文件 |
| `hermes/hermes.md` | 项目级 Context File |

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
# Skill 方式
cp hermes/skills/inner-os/SKILL.md ~/.hermes/skills/personality/inner-os/SKILL.md

# Context File 方式
cp hermes/hermes.md ./.hermes.md
```

> **提示：** 每次切换人设后都需要重新复制。如果使用外部目录引用方式，脚本直接修改源文件，无需额外复制。

## 故障排查

### Skill 未被发现

1. 确认文件位于正确路径：

```bash
ls ~/.hermes/skills/personality/inner-os/SKILL.md
```

2. 如使用外部目录，确认 `config.yaml` 配置正确：

```bash
cat ~/.hermes/config.yaml | grep -A 3 external_dirs
```

3. 不存在的路径会被静默跳过，检查路径拼写

### Context File 不生效

1. 确认 `.hermes.md` 在项目根目录：

```bash
ls -la .hermes.md
```

2. Hermes 使用"第一个匹配"策略。如果项目中同时存在 `.hermes.md` 和其他上下文文件，只有 `.hermes.md` 生效

3. 上下文文件有 20,000 字符上限和安全扫描，确保内容未被截断或拦截

### 协议更新

```bash
# Skill 方式
cp hermes/skills/inner-os/SKILL.md ~/.hermes/skills/personality/inner-os/SKILL.md

# Context File 方式
cp hermes/hermes.md ./.hermes.md
```
