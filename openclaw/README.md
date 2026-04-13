# OpenClaw 适配

在 [OpenClaw](https://github.com/openclaw/openclaw) 中启用 AI Inner OS。

## 安装

### 方式一：Workspace Skill（推荐）

将 Inner OS 安装为当前工作区技能，获得 `/inner-os` 斜杠命令：

```bash
# 复制到当前工作区的 skills 目录（最高优先级）
mkdir -p skills
cp -r openclaw/skills/inner-os skills/inner-os
```

### 方式二：全局 Skill

对所有 agent 生效：

```bash
# 复制到全局 skills 目录
mkdir -p ~/.openclaw/skills
cp -r openclaw/skills/inner-os ~/.openclaw/skills/inner-os

# 或复制到跨工作区的 agents 目录
mkdir -p ~/.agents/skills
cp -r openclaw/skills/inner-os ~/.agents/skills/inner-os
```

### 方式三：外部目录引用

避免复制，在 `openclaw.json` 中配置外部 skills 目录：

```json5
{
  skills: {
    load: {
      extraDirs: ["/path/to/AI-Inner-Os/openclaw/skills"]
    }
  }
}
```

### 方式四：ClawHub（待发布）

```bash
openclaw skills install inner-os
```

## 安装后验证

在 OpenClaw 会话中输入：

```
/inner-os
```

或检查技能是否已加载：

```bash
openclaw skills list
```

## 工作原理

OpenClaw 的 Skills 系统使用 AgentSkills 兼容的 `SKILL.md` 格式。Inner OS 作为一个 user-invocable skill 注册，加载后协议注入到系统 prompt。

| 机制 | 文件 | 作用 |
|------|------|------|
| Skill | `skills/inner-os/SKILL.md` | 注入协议，提供 `/inner-os` 命令 |

### Skill 加载优先级

OpenClaw 从 6 个位置加载 skills，后者覆盖前者：

| 优先级 | 位置 | 适用范围 |
|--------|------|----------|
| 最低 | `skills.load.extraDirs` | 外部共享 |
| 2 | Bundled（内置） | 所有 agent |
| 3 | `~/.openclaw/skills` | 全局 |
| 4 | `~/.agents/skills` | 跨工作区 |
| 5 | `<workspace>/.agents/skills` | 项目级 |
| 最高 | `<workspace>/skills` | 工作区级 |

## 配置

可在 `openclaw.json` 中控制 skill 开关：

```json5
{
  skills: {
    entries: {
      "inner-os": {
        enabled: true
      }
    }
  }
}
```

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent | OpenClaw |
|---|---|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | AGENTS.md | `.mdc` 规则 | instructions 指令文件 | Skill 或 `.hermes.md` | Skill（AgentSkills 格式） |
| Hook 支持 | 6 个 | 4 个 | 2 个 | 无 | 无 | 无（插件管理） |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 | 不支持 | 不支持 |
| 安装方式 | 插件市场 | 手动复制 | 复制 .mdc | 复制指令文件 | 复制 Skill | 复制 Skill 或 ClawHub |
| 斜杠命令 | `/inner-os`（命令） | 无 | 无 | 无 | `/inner-os`（Skill） | `/inner-os`（Skill） |
