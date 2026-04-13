# 安装指南

AI Inner OS 支持 6 个平台。选择你使用的平台查看详细安装文档：

| 平台 | 安装方式 | 详细指南 |
|------|---------|---------|
| **Claude Code** | 插件市场一键安装 | [install-claude-code.md](install-claude-code.md) |
| **Codex CLI** | AGENTS.md + Hooks | [install-codex.md](install-codex.md) |
| **Cursor** | `.mdc` 规则文件 | [install-cursor.md](install-cursor.md) |
| **OpenCode CLI** | instructions 指令文件 | [install-opencode.md](install-opencode.md) |
| **Hermes Agent** | Skill 或 Context File | [install-hermes.md](install-hermes.md) |
| **OpenClaw** | Skill（AgentSkills 格式） | [install-openclaw.md](install-openclaw.md) |

## 快速选择

- **想要最完整的体验？** → [Claude Code](install-claude-code.md)（6 个生命周期 hook，插件市场一键安装）
- **使用 OpenAI 生态？** → [Codex CLI](install-codex.md)（4 个 hook，手动配置）
- **用 IDE 写代码？** → [Cursor](install-cursor.md)（规则文件自动生效）
- **轻量级 CLI？** → [OpenCode CLI](install-opencode.md)（纯静态注入）
- **自治 AI Agent？** → [Hermes Agent](install-hermes.md) 或 [OpenClaw](install-openclaw.md)（Skill 系统 + `/inner-os` 命令）

## 平台能力对比

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent | OpenClaw |
|---|---|---|---|---|---|---|
| 协议注入 | Hook 动态读取 | AGENTS.md | `.mdc` 规则 | instructions | Skill / `.hermes.md` | Skill |
| Hook 数量 | 6 | 4 | 2 | 0 | 0 | 0 |
| 失败追踪 | 有 | — | — | — | — | — |
| 斜杠命令 | `/inner-os` | — | — | — | `/inner-os` | `/inner-os` |
| 共享逻辑 | `hooks/lib/` | 复用 | 复用 | — | — | — |
| 安装难度 | 一键 | 中等 | 简单 | 简单 | 简单 | 简单 |

## 通用前置条件

- 克隆本仓库或下载对应平台的文件：

```bash
git clone https://github.com/SummerSec/AI-Inner-Os.git
cd AI-Inner-Os
```

- Claude Code 用户可跳过克隆，直接通过插件市场安装

## 验证安装

无论哪个平台，安装成功后 AI 应当在回复中自然出现独白：

```
▎InnerOS：这仓库现在还像毛坯房，先把承重墙立起来再说。
```

独白是否出现由 AI 自己判断，不保证每次回复都有。如果连续多次对话都没有独白，请参考对应平台指南的故障排查章节。

## 协议数据源

所有平台的协议内容派生自唯一的数据源：[`skills/inner-os/SKILL.md`](../skills/inner-os/SKILL.md)。

各平台的适配文件是手动同步的静态副本（Claude Code 除外，它在运行时动态读取 SKILL.md）。当上游协议更新后，需重新复制对应平台的文件。
