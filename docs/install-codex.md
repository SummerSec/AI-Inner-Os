# Codex CLI 安装指南

在 [OpenAI Codex CLI](https://github.com/openai/codex) 中安装 AI Inner OS。

## 前置条件

- Codex CLI 已安装
- Node.js >= 18
- Codex hooks 功能已启用

## 安装步骤

### 第一步：注入 Inner OS 协议

将协议追加到 `AGENTS.md`（Codex 的指令文件）：

```bash
# 全局生效（所有项目）
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# 或项目级生效（仅当前项目）
cat codex/AGENTS.md >> ./AGENTS.md
```

> **注意：** 使用 `>>` 追加而非 `>` 覆盖，避免丢失已有内容。

### 第二步：配置 Hooks

复制 hooks 配置文件：

```bash
# 全局配置
cp codex/hooks.json ~/.codex/hooks.json

# 或项目级配置
mkdir -p .codex
cp codex/hooks.json .codex/hooks.json
```

### 第三步：复制 Hook 脚本

Hook 脚本需要可访问。选择以下任一方式：

**方式 A：引用仓库路径（推荐开发者）**

编辑 `hooks.json`，将脚本路径改为仓库的绝对路径：

```json
{
  "hooks": [
    {
      "name": "SessionStart",
      "type": "command",
      "command": "node /path/to/AI-Inner-Os/codex/hooks/session-start.js"
    }
  ]
}
```

**方式 B：复制脚本到 Codex 目录**

```bash
# 复制 hook 脚本
cp -r codex/hooks/ ~/.codex/inner-os-hooks/

# 复制共享逻辑
cp -r hooks/lib/ ~/.codex/inner-os-hooks/lib/

# 更新 hooks.json 中的路径
```

### 第四步：启用 Hooks 功能

确认 Codex 配置中已启用 hooks：

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
| `SessionStart` | 会话启动 | 初始化会话状态 |
| `PreToolUse` | 工具执行前 | 注入即将执行的工具上下文 |
| `PostToolUse` | 工具执行后 | 追踪事件，注入最近活动上下文 |
| `SessionStop` | 会话结束 | 清理状态文件 |

### 与 Claude Code 的差异

| | Claude Code | Codex CLI |
|---|---|---|
| 协议注入 | Hook 动态读取 `SKILL.md` | `AGENTS.md` 静态加载 |
| 失败追踪 | `PostToolUseFailure` 独立 hook | 不支持（Codex 暂无此 hook） |
| Hook 数量 | 6 个 | 4 个 |
| 安装方式 | 插件市场一键安装 | 手动复制配置文件 |
| 路径解析 | `${CLAUDE_PLUGIN_ROOT}` 自动解析 | 需手动设置绝对路径 |

## 文件说明

| 文件 | 作用 |
|------|------|
| `codex/AGENTS.md` | Inner OS 协议（追加到 Codex 指令文件） |
| `codex/hooks.json` | Hook 注册配置 |
| `codex/hooks/session-start.js` | 会话启动初始化 |
| `codex/hooks/pre-tool-use.js` | 工具执行前上下文 |
| `codex/hooks/post-tool-use.js` | 工具执行后追踪 |
| `codex/hooks/session-stop.js` | 会话结束清理 |

所有 hook 脚本通过相对路径引用 `hooks/lib/` 中的共享逻辑。

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

当上游 `skills/inner-os/SKILL.md` 更新后，需手动同步 `codex/AGENTS.md`：

```bash
# 重新追加到全局 AGENTS.md
# 注意：先移除旧的 Inner OS 部分再追加
```
