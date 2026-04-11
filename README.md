# AI-Inner-Os

`AI-Inner-Os` 是一个面向 `Claude Code`、`Codex` 等 AI CLI 工具的插件项目。

它的核心目标，是把 AI 在工作过程中的“内心独白”展示出来：让 AI 在执行任务时产生的过程性表达、吐槽、自言自语、思路碎片，不再只停留在黑盒里，而是能够被实时看到。

这个项目关注的不是让模型变得更聪明，而是让 AI 的工作过程变得更可见、更有表达感、更具陪伴感。它希望把原本只有最终结果的 CLI 交互，变成一种可以看到 AI “边想边说”的体验。

## 项目定位

- 这是一个 `CLI 插件`
- 服务对象是 `Claude Code`、`Codex` 等 AI Agent 工具
- 核心能力是 `展示 AI 的内心独白与过程表达`
- 目标体验是让 AI 在终端工作时“活起来”

## 想解决的问题

当前很多 AI CLI 工具只展示最终答案，用户看不到 AI 在执行过程中的情绪、犹豫、吐槽和中间表达。`AI-Inner-Os` 希望把这些内容以合适的方式展示出来，让交互过程更透明，也更有趣。

## 当前实现方向

- 参考 `pua` 的仓库组织方式，搭多平台可扩展骨架
- 第一版优先实现 `Claude Code`
- 通过 `hook` 自动注入 `Inner OS` 协议
- 默认输出格式参考 `pua` 的旁白感，采用 `▎InnerOS：...`
- 不预设固定语气映射，允许 AI 自由决定表达风格

## Claude Code 第一版

第一版不尝试暴露模型的真实隐藏推理，而是通过插件和 hook 注入，让 AI 在正常完成任务时，可以额外输出一层可见的自由独白。

核心原则：

- 独白是允许被用户直接看到的
- AI 可以用任何风格、任何语气表达
- 主任务优先，独白不能替代实际交付内容
- 独白默认使用 `▎InnerOS：...` 前缀

## 当前仓库结构

```text
.
├─ .claude-plugin/
├─ commands/
├─ codex/
├─ cursor/
├─ docs/
├─ hooks/
├─ skills/
└─ state/
```

主要目录说明：

- `hooks/`：Claude Code 生命周期脚本
- `hooks/hooks.json`：Claude Code hook 注册清单
- `hooks/lib/`：状态、prompt、事件归一化、输出格式等共享逻辑
- `skills/inner-os/`：Inner OS 行为协议
- `.claude-plugin/plugin.json`：Claude Code 插件元信息
- `.claude-plugin/marketplace.json`：本地市场/安装元信息
- `docs/architecture.md`：当前架构说明
- `codex/`、`cursor/`：后续多平台适配占位

## 目前状态

当前仓库已经搭起第一版基础框架，包括：

- 插件根元信息 `plugin.json`
- Claude Code 插件元信息 `.claude-plugin/plugin.json`
- Claude Code hook 注册文件 `hooks/hooks.json`
- `SessionStart`、`PostToolUse`、`PreCompact`、`Stop` 四个 hook 骨架
- 会话状态文件读写
- Inner OS prompt 注入逻辑
- `skills/inner-os/SKILL.md`
- 基础单元测试

下一步重点会是：

- 完成手动命令开关
- 打通真实安装和本地联调
- 再扩展到 `Codex` 和 `Cursor`
