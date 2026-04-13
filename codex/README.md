# Codex 适配

在 [OpenAI Codex CLI](https://github.com/openai/codex) 中启用 AI Inner OS。

## 安装

### 1. 复制 AGENTS.md

将 Inner OS 协议注入到你的全局或项目级指令中：

```bash
# 全局生效（所有项目）
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# 或项目级生效
cat codex/AGENTS.md >> ./AGENTS.md
```

### 2. 配置 hooks

将 `codex/hooks.json` 的内容合并到你的 Codex hooks 配置中：

```bash
# 全局
cp codex/hooks.json ~/.codex/hooks.json

# 或项目级
cp codex/hooks.json .codex/hooks.json
```

> 注意：hook 脚本路径需要调整为你实际克隆本仓库的绝对路径，或将 `codex/hooks/` 和 `hooks/lib/` 复制到对应位置。

### 3. 确认 hooks 功能已启用

在 `~/.codex/config.toml` 或项目级 `.codex/config.toml` 中确认：

```toml
[features]
codex_hooks = true
```

## Hook 生命周期

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动 | 初始化会话状态 |
| `PreToolUse` | 工具执行前 | 注入即将执行的工具上下文 |
| `PostToolUse` | 工具执行后 | 追踪事件，注入最近活动上下文 |
| `SessionStop` | 会话结束 | 清理状态文件 |

## Persona（人设切换）

Codex CLI 支持读取 Inner OS 人设配置。手动编辑 `personas/_active.json` 来切换：

```json
{
  "persona": "tsundere",
  "updatedAt": "2026-04-13T10:00:00.000Z"
}
```

可选值：`default`、`tsundere`、`cold`、`cheerful`、`philosopher`、`sarcastic`，或 `personas/custom/` 下自定义文件名。

## 与 Claude Code 版本的差异

| | Claude Code | Codex CLI |
|---|---|---|
| 协议注入 | SessionStart hook 自动读取 SKILL.md | AGENTS.md 静态加载 |
| 失败追踪 | PostToolUseFailure 独立 hook | 无（Codex 暂不支持） |
| Hook 数量 | 6 个 | 4 个 |
| 安装方式 | 插件市场一键安装 | 手动复制配置文件 |
