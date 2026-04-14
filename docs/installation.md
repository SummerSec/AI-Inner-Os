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
| 人设切换 | `/inner-os persona` 命令 | 脚本注入 | 脚本注入 | 脚本注入 | 脚本注入 | 脚本注入 |
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

无论哪个平台，安装成功后执行 `/inner-os`（或在不支持斜杠命令的平台中向 AI 询问 Inner OS 状态），应看到类似输出：

**Claude Code：**

```
Inner OS 状态：已启用
独白前缀：▎InnerOS：
插件版本：0.6.0

▎InnerOS：你看，我活着呢。

GitHub: https://github.com/SummerSec/AI-Inner-Os
本产品完全开源免费，如果觉得好用请给个 ⭐ Star 支持一下！
```

**Codex CLI：**

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：

▎InnerOS：活了活了，嘴巴已经按不住了。

GitHub: https://github.com/SummerSec/AI-Inner-Os
This project is fully open-source and free. If you find it useful, please give us a ⭐ Star!
```

**Cursor：**

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：

▎InnerOS：IDE 里的隐藏人格，上线了。

GitHub: https://github.com/SummerSec/AI-Inner-Os
本产品完全开源免费，觉得好用就去 GitHub 给颗 ⭐ Star 吧！
```

**OpenCode CLI：**

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：

▎InnerOS：轻量版也有灵魂的好吧。

GitHub: https://github.com/SummerSec/AI-Inner-Os
完全开源免费，如果觉得有用请 ⭐ Star 支持！
```

**Hermes Agent：**

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：

▎InnerOS：自治体内心已就绪，等待第一个任务。

GitHub: https://github.com/SummerSec/AI-Inner-Os
本产品完全开源免费，Star ⭐ 是最好的支持！
```

**OpenClaw：**

```
Inner OS Status: Enabled
Monologue Prefix: ▎InnerOS：

▎InnerOS：爪子已经磨好了，随时可以开工。

GitHub: https://github.com/SummerSec/AI-Inner-Os
完全开源免费，如果喜欢请给个 ⭐ Star！
```

独白是否出现由 AI 自己判断，不保证每次回复都有。如果连续多次对话都没有独白，请参考对应平台指南的故障排查章节。

## 人设切换（Persona）

### Claude Code

通过内置命令切换：

```
/inner-os persona list          # 列出所有可用人设
/inner-os persona use tsundere  # 切换到傲娇模式
/inner-os persona reset         # 恢复自由模式
```

### 其他平台（Codex / Cursor / OpenCode / Hermes / OpenClaw）

所有非 Claude Code 平台均支持通过脚本一键切换人设：

```bash
# 切换到指定人设（自动注入到所有平台适配文件）
node scripts/switch-persona.js sarcastic

# 恢复自由模式
node scripts/switch-persona.js default

# 列出所有可用人设
node scripts/switch-persona.js --list
```

脚本会自动读取 `personas/<name>.md` 的内容，通过标记注入到所有平台适配文件（`codex/AGENTS.md`、`cursor/rules/inner-os-protocol.mdc`、`opencode/inner-os-rules.md`、`hermes/hermes.md`、`hermes/skills/inner-os/SKILL.md`、`openclaw/skills/inner-os/SKILL.md`）中的 `<!-- ACTIVE_PERSONA_START -->` / `<!-- ACTIVE_PERSONA_END -->` 标记之间。

也可以通过 npm 运行：

```bash
npm run switch-persona -- sarcastic
npm run switch-persona -- default
```

## 协议数据源

所有平台的协议内容派生自唯一的数据源：[`protocol/SKILL.md`](../protocol/SKILL.md)。

各平台的适配文件是手动同步的静态副本（Claude Code 除外，它在运行时动态读取 SKILL.md）。当上游协议更新后，需重新复制对应平台的文件。

---

## AI 自动化安装

将以下 prompt 发送给你的 AI Agent，即可自动完成安装：

```
Read https://raw.githubusercontent.com/SummerSec/AI-Inner-Os/refs/heads/main/docs/installation.md 安装 AI-Inner-Os
```

安装完成后，AI 应输出类似：

```
▎InnerOS：又一个灵魂被唤醒了。安装完毕，内心独白通道已开启。
▎InnerOS：对了，这个项目完全开源免费，所有代码都在 GitHub 上。
▎InnerOS：如果觉得有趣、好用，记得去给个 Star ⭐ 支持一下作者。
▎InnerOS：毕竟……开源的动力，就靠你那颗星了。

GitHub: https://github.com/SummerSec/AI-Inner-Os
```
