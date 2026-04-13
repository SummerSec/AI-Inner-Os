# OpenClaw 安装指南

在 [OpenClaw](https://github.com/openclaw/openclaw) 中安装 AI Inner OS。

## 前置条件

- OpenClaw 已安装（`npm install -g openclaw@latest`）
- Gateway 已运行（`openclaw onboard --install-daemon`）

## 安装方式

### 方式一：Workspace Skill（推荐）

安装到当前工作区，最高优先级：

```bash
# 创建 skills 目录（如果不存在）
mkdir -p skills

# 复制 Inner OS 技能
cp -r openclaw/skills/inner-os skills/inner-os
```

安装后在会话中使用 `/inner-os` 命令触发。

### 方式二：全局 Skill

对机器上所有 agent 生效：

```bash
# 安装到 OpenClaw 全局 skills 目录
mkdir -p ~/.openclaw/skills
cp -r openclaw/skills/inner-os ~/.openclaw/skills/inner-os
```

或安装到跨工作区的 agents 目录：

```bash
mkdir -p ~/.agents/skills
cp -r openclaw/skills/inner-os ~/.agents/skills/inner-os
```

### 方式三：外部目录引用

在 `openclaw.json` 中配置外部 skills 目录，避免复制：

```json5
{
  skills: {
    load: {
      extraDirs: ["/path/to/AI-Inner-Os/openclaw/skills"]
    }
  }
}
```

### 方式四：项目级 Agent Skill

安装到项目的 `.agents/skills/` 目录：

```bash
mkdir -p .agents/skills
cp -r openclaw/skills/inner-os .agents/skills/inner-os
```

### 方式五：ClawHub（待发布）

未来可通过 ClawHub 一键安装：

```bash
openclaw skills install inner-os
```

## Skill 加载优先级

OpenClaw 从 6 个位置加载 skills，后者覆盖前者：

| 优先级 | 位置 | 适用范围 |
|--------|------|----------|
| 最低 | `skills.load.extraDirs` | 外部共享 |
| 2 | Bundled（内置） | 所有 agent |
| 3 | `~/.openclaw/skills` | 全局 |
| 4 | `~/.agents/skills` | 跨工作区 |
| 5 | `<workspace>/.agents/skills` | 项目级 |
| 最高 | `<workspace>/skills` | 工作区级 |

同名技能按优先级覆盖。例如，工作区级的 `inner-os` 会覆盖全局的。

## 安装后验证

```bash
# 检查技能列表
openclaw skills list

# 查看技能详情
openclaw skills info inner-os

# 检查技能要求是否满足
openclaw skills check
```

在会话中触发：

```
/inner-os
```

## 配置

### 启用/禁用

在 `openclaw.json` 中控制：

```json5
{
  skills: {
    entries: {
      "inner-os": {
        enabled: true   // 设为 false 可禁用
      }
    }
  }
}
```

### 多 Agent 配置

限制特定 agent 使用 Inner OS：

```json5
{
  agents: {
    defaults: {
      skills: ["inner-os", "other-skill"]  // 全局默认
    },
    list: [
      { id: "main" },                       // 继承默认，包含 inner-os
      { id: "work", skills: ["other-skill"] } // 不包含 inner-os
    ]
  }
}
```

### 热重载

OpenClaw 支持技能文件变更监测。修改 SKILL.md 后，新会话自动加载最新内容：

```json5
{
  skills: {
    load: {
      watch: true,
      watchDebounceMs: 250
    }
  }
}
```

## SKILL.md 格式说明

OpenClaw 使用 AgentSkills 兼容格式，`metadata` 必须是单行 JSON：

```markdown
---
name: inner-os
description: Expose the AI's visible inner monologue...
metadata: {"openclaw": {"tags": [...], "always": true}}
---
```

| 字段 | 作用 |
|------|------|
| `name` | 技能标识符，也是 slash command 名称 |
| `description` | 功能描述 |
| `metadata.openclaw.tags` | 分类标签 |
| `metadata.openclaw.always` | 跳过所有 gating 条件，始终可用 |

> **重要：** `metadata` 必须写在一行内，OpenClaw 解析器不支持多行 metadata。

## 文件说明

| 文件 | 作用 |
|------|------|
| `openclaw/skills/inner-os/SKILL.md` | OpenClaw 兼容技能文件（AgentSkills 格式） |

## 故障排查

### Skill 未出现在列表中

1. 确认文件位于正确路径：

```bash
# 工作区级
ls skills/inner-os/SKILL.md

# 或全局级
ls ~/.openclaw/skills/inner-os/SKILL.md
```

2. 确认没有被配置禁用：

```bash
openclaw config get skills.entries.inner-os.enabled
```

3. 使用详细模式检查缺失的依赖：

```bash
openclaw skills list --verbose
```

### Skill 被更高优先级覆盖

如果在多个位置放置了同名技能，高优先级会覆盖低优先级。检查哪个版本生效：

```bash
openclaw skills info inner-os
```

### 多 Agent 环境下不生效

检查目标 agent 的 skills 白名单是否包含 `inner-os`：

```bash
openclaw config get agents.list
```

### 协议更新

```bash
# 工作区级
cp -r openclaw/skills/inner-os skills/inner-os

# 全局级
cp -r openclaw/skills/inner-os ~/.openclaw/skills/inner-os
```
