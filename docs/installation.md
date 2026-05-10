# 安装指南

AI Inner OS 支持 6 个平台。选择你使用的平台查看详细安装文档：

| 平台 | 正式安装方式 | 详细指南 |
|------|---------|---------|
| **Claude Code** | 插件市场一键安装 | [install-claude-code.md](install-claude-code.md) |
| **Codex CLI** | Codex plugin / marketplace | [install-codex.md](install-codex.md) |
| **Cursor** | Cursor plugin / marketplace | [install-cursor.md](install-cursor.md) |
| **OpenCode CLI** | OpenCode plugin package | [install-opencode.md](install-opencode.md) |
| **Hermes Agent** | Hermes plugin | [install-hermes.md](install-hermes.md) |
| **OpenClaw** | OpenClaw plugin / ClawHub | [install-openclaw.md](install-openclaw.md) |

## 快速选择

- **想要最完整的体验？** → [Claude Code](install-claude-code.md)（9 个生命周期 hook，插件市场一键安装）
- **使用 OpenAI 生态？** → [Codex CLI](install-codex.md)（通过 Codex plugin/marketplace 安装）
- **用 IDE 写代码？** → [Cursor](install-cursor.md)（通过 Cursor plugin/marketplace 安装）
- **轻量级 CLI？** → [OpenCode CLI](install-opencode.md)（通过 OpenCode plugin package 安装）
- **自治 AI Agent？** → [Hermes Agent](install-hermes.md) 或 [OpenClaw](install-openclaw.md)（通过平台插件系统安装）

## 平台能力对比

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent | OpenClaw |
|---|---|---|---|---|---|---|
| 协议注入 | Hook 动态读取 | SessionStart Hook | sessionStart Hook | Plugin + instructions | Plugin hook | Plugin hook + Skill |
| Hook 数量 | 9 | 3 | 3 | Plugin | Python plugin hooks | OpenClaw plugin hooks |
| 失败追踪 | 有 | — | — | — | — | — |
| 斜杠命令 | `/inner-os` | — | — | `inner-os` tool | `/inner-os` | `/inner-os` |
| 人设切换 | `/inner-os persona` 命令 | 动态（Hook 读取） | 动态（Hook 读取） | Plugin tool | 脚本注入 | 脚本注入 |
| 可选人物画像 | Skill | Skill | Skill | 显式请求 | Plugin Skill | Plugin Skill |
| 共享逻辑 | `hooks/lib/` | 复用 | 复用 | 独立 Plugin | — | — |
| 安装方式 | Marketplace | Plugin / marketplace | Plugin / marketplace | Plugin package | Plugin | Plugin / ClawHub |

## 正式安装原则

面向普通用户的安装文档只提供各平台官方插件机制：marketplace、plugin package、平台插件目录或 ClawHub。这样版本号更新后，平台插件缓存或 marketplace 才能识别新版本并拉取更新。

`scripts/install.js`、手动复制 `.mdc` / `AGENTS.md` / `SKILL.md`、以及直接复制 hook 配置，只用于本仓库开发、调试或临时验证；这些方式不会自动更新，发布文档不再作为正式安装路径推荐。

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

默认频率为 `normal`，每个明确任务至少出现一次独白；如需更高频率，请使用各平台插件配置中的 `frequency: "high"` 或对应环境变量。

## 可选用户人物画像

本项目随插件分发 `user-profile-distillation` 可选 skill，用于在用户明确要求时，根据用户粘贴的提示词或本地历史提示词，蒸馏工作画像、沟通偏好和协作建议。

该能力默认不启用，不会自动读取历史。只有用户明确同意读取本地历史后，才可调用 `agent-chat-history` 的只读查询脚本提取 prompts。画像输出不得包含长原文、敏感推断、心理诊断或受保护属性推断，也不会默认写入文件或长期记忆。

如用户明确开启“持续进化”，画像会在当前对话中按 `Profile v1 → v2` 的方式增量更新，记录新增证据、被修正的判断和下一轮协作策略。该模式仍不自动保存到配置、文件或记忆。

## 人设切换（Persona）

### Claude Code

通过内置命令切换，无需额外操作：

```
/inner-os persona list          # 列出所有可用人设
/inner-os persona use tsundere  # 切换到傲娇模式
/inner-os persona reset         # 恢复自由模式
```

### 其他平台（Codex / Cursor / OpenCode / Hermes / OpenClaw）

请优先使用平台插件配置提供的人设和频率能力。源码脚本 `scripts/switch-persona.js` 仅用于插件开发者同步仓库内静态副本，不作为正式用户安装或更新流程。

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
