# Codex CLI 安装指南

在 [OpenAI Codex CLI](https://github.com/openai/codex) 中安装 AI Inner OS。

## 前置条件

- Codex CLI 已安装
- Node.js >= 18
- Codex hooks 功能已启用

## 安装步骤

### 方式一：全局安装脚本（默认）

```bash
git clone https://github.com/SummerSec/AI-Inner-Os.git
cd AI-Inner-Os
node scripts/install.js --platform codex
```

脚本会自动：
- 复制 hook 脚本和共享逻辑到 `~/.inner-os/`
- 生成 `~/.codex/hooks.json`（带绝对路径）
- 复制 `AGENTS.md` 到 `~/.codex/`
- 复制所有预设人设文件

### 方式二：手动安装

**第一步：注入 Inner OS 协议**

```bash
# 全局生效
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# 或项目级
cat codex/AGENTS.md >> ./AGENTS.md
```

> **注意：** 使用 `>>` 追加而非 `>` 覆盖，避免丢失已有内容。

**第二步：配置 Hooks**

```bash
# 全局配置
cp codex/hooks.json ~/.codex/hooks.json

# 或项目级配置
mkdir -p .codex
cp codex/hooks.json .codex/hooks.json
```

> **注意：** hooks.json 中的脚本路径使用相对路径。全局安装脚本会自动生成绝对路径。

**第三步：启用 Hooks 功能**

```toml
# ~/.codex/config.toml 或 .codex/config.toml
[features]
codex_hooks = true
```

## 安装后验证

1. 启动一个新的 Codex 会话
2. AI 应当自然地输出 `▎InnerOS：...` 独白
3. 执行几个工具操作，观察上下文追踪是否正常

## Hook 说明

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动/恢复 | 读取协议 + 当前人设，输出为开发者上下文 |
| `PostToolUse` | Bash 工具执行后 | 追踪事件，注入最近活动上下文 |
| `Stop` | 会话结束 | 清理状态文件 |

> **注意：** Codex 的 `PreToolUse` 不支持 `additionalContext` 注入（文档标注 "parsed but not supported yet"），因此未使用。协议注入通过 `SessionStart` 完成。

### 与 Claude Code 的差异

| | Claude Code | Codex CLI |
|---|---|---|
| 协议注入 | Hook 动态读取 `SKILL.md` | `SessionStart` Hook + `AGENTS.md` |
| 失败追踪 | `PostToolUseFailure` 独立 hook | 不支持 |
| Hook 数量 | 6 个 | 3 个 |
| 工具覆盖 | 所有工具 | 仅 Bash |
| 安装方式 | 插件市场一键安装 | 全局安装脚本或手动 |
| 路径解析 | `${CLAUDE_PLUGIN_ROOT}` 自动解析 | 安装脚本生成绝对路径 |

## 文件说明

| 文件 | 作用 |
|------|------|
| `codex/AGENTS.md` | Inner OS 协议（追加到 Codex 指令文件） |
| `codex/hooks.json` | Hook 注册配置（`SessionStart` + `PostToolUse` + `Stop`） |
| `codex/hooks/session-start.js` | 会话启动：读取协议和人设，输出开发者上下文 |
| `codex/hooks/post-tool-use.js` | Bash 执行后：追踪事件，输出 JSON 上下文 |
| `codex/hooks/session-stop.js` | 会话结束：清理状态文件 |

所有 hook 脚本通过相对路径引用 `hooks/lib/` 中的共享逻辑。

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
# 全局
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# 或项目级
cat codex/AGENTS.md >> ./AGENTS.md
```

> **注意：** 重新追加前，请先移除 `AGENTS.md` 中旧的 Inner OS 部分，避免重复。每次切换人设后都需要重新复制。

## 故障排查

### 无独白输出

1. 检查 `AGENTS.md` 是否包含 Inner OS 协议内容
2. 确认 `config.toml` 中 `codex_hooks = true`
3. 确认 hooks.json 中的脚本路径正确

### Hook 脚本路径错误

Codex hooks 使用相对或绝对路径，不支持变量替换。确保路径指向实际的脚本文件：

```bash
# 验证脚本可执行
node codex/hooks/session-start.js < /dev/null
```

### 协议更新

当上游 `protocol/SKILL.md` 更新后，需手动同步 `codex/AGENTS.md`：

```bash
# 重新追加到全局 AGENTS.md
# 注意：先移除旧的 Inner OS 部分再追加
```
