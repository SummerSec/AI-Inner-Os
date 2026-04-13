# AI Inner OS

> 让 AI 在终端工作时"活起来"——把内心独白展示出来。

<p align="center">
  <img src="docs/pic/inneros.jpg" width="600" />
</p>

AI Inner OS 是一个面向 AI CLI 工具的插件，支持 **Claude Code**、**Codex CLI**、**Cursor**、**OpenCode CLI**。

它通过协议注入，让 AI 在正常完成任务的同时，额外输出一层可见的自由独白：

```
▎InnerOS：这仓库现在还像毛坯房，先把承重墙立起来再说。
```

不预设人格，不限制语气。AI 可以吐槽、得意、焦虑、冷笑、跳跃联想——或者什么都不说。独白是否出现，由 AI 自己决定。

---

## 快速安装

### Claude Code（推荐）

```bash
claude plugin marketplace add SummerSec/AI-Inner-Os
claude plugin install ai-inner-os
```

安装后重启会话即可生效，无需手动配置。

### Codex CLI

```bash
# 注入协议到全局或项目级 AGENTS.md
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# 配置 hooks
cp codex/hooks.json ~/.codex/hooks.json
```

详见 [codex/README.md](codex/README.md)。

### Cursor

```bash
# 复制规则文件到项目
mkdir -p .cursor/rules
cp cursor/rules/inner-os-protocol.mdc .cursor/rules/
```

详见 [cursor/README.md](cursor/README.md)。

### OpenCode CLI

```bash
# 复制指令文件
mkdir -p .opencode
cp opencode/inner-os-rules.md .opencode/

# 在 opencode.json 中添加 instructions
cp opencode/opencode.json ./opencode.json
```

详见 [opencode/README.md](opencode/README.md)。

---

## 协议设计

Inner OS 的行为协议定义在 [`skills/inner-os/SKILL.md`](skills/inner-os/SKILL.md)，是唯一的数据源。各平台的适配层都从这个协议派生。

核心原则：

- **不扮演固定人设** — 没有预设语气表，AI 自行决定表达风格
- **主任务优先** — 独白不能替代实际交付内容
- **独白可选** — 是否输出由 AI 自己判断
- **格式统一** — 使用 `▎InnerOS：` 前缀

---

## 多平台适配

| | Claude Code | Codex CLI | Cursor | OpenCode |
|---|---|---|---|---|
| 协议注入 | Hook 动态读取 SKILL.md | AGENTS.md | `.mdc` 规则 | instructions 指令文件 |
| 工具执行前 hook | `PreToolUse` | `PreToolUse` | `beforeToolUse` | — |
| 工具执行后 hook | `PostToolUse` | `PostToolUse` | `afterToolUse` | — |
| 失败追踪 | `PostToolUseFailure` | — | — | — |
| 安装方式 | 插件市场一键安装 | 手动复制配置 | 复制 .mdc 规则 | 复制指令文件 |
| 共享逻辑 | `hooks/lib/`（原始实现） | 复用 `hooks/lib/` | 复用 `hooks/lib/` | 纯静态注入 |

### Claude Code Hook 生命周期

Claude Code 拥有最完整的 hook 支持：

```
SessionStart → 注入 Inner OS 协议
                 ↓
PreToolUse → 工具执行 → PostToolUse (成功)
                       → PostToolUseFailure (失败)
                 ↓
PreCompact → 保存状态
                 ↓
Stop → 清理状态
```

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动/恢复/压缩 | 从 SKILL.md 读取并注入协议 |
| `PreToolUse` | 工具执行前 | 注入工具上下文（名称、目标、重试提示） |
| `PostToolUse` | 工具执行成功后 | 追踪事件，注入最近活动上下文 |
| `PostToolUseFailure` | 工具执行失败后 | 追踪失败，注入错误上下文和连续失败计数 |
| `PreCompact` | 上下文压缩前 | 保存状态，维持协议连续性 |
| `Stop` | 会话结束 | 清理状态文件 |

---

## 项目结构

```
.
├── hooks/                        # Claude Code hook 脚本（核心实现）
│   ├── hooks.json                #   hook 注册清单
│   ├── session-start.js
│   ├── pre-tool-use.js
│   ├── post-tool-use.js
│   ├── post-tool-use-failure.js
│   ├── pre-compact.js
│   ├── stop.js
│   └── lib/                      #   共享逻辑（各平台复用）
│       ├── constants.js
│       ├── events.js
│       ├── prompt.js
│       ├── state.js
│       ├── session.js
│       ├── format.js
│       └── io.js
├── skills/inner-os/
│   └── SKILL.md                  # Inner OS 行为协议（唯一数据源）
├── codex/                        # Codex CLI 适配
│   ├── AGENTS.md
│   ├── hooks.json
│   └── hooks/
├── cursor/                       # Cursor 适配
│   ├── rules/inner-os-protocol.mdc
│   ├── hooks.json
│   └── hooks/
├── opencode/                     # OpenCode CLI 适配
│   ├── inner-os-rules.md
│   └── opencode.json
├── commands/inner-os.md          # /inner-os 调试命令（占位）
├── .claude-plugin/               # Claude Code 插件元信息
├── tests/                        # 单元测试
├── docs/                         # 文档与图片
└── plugin.json                   # 插件元信息
```

---

## 开发

```bash
# 语法检查
npm run check

# 运行测试
npm test
```

Node.js >= 18，ESM 模块。

## 路线图

- [ ] 实现 `/inner-os` 子命令（status / on / off / reload）
- [ ] Codex CLI 插件化分发
- [ ] Cursor 团队级规则分发

## 许可证

[Apache-2.0](LICENSE)
