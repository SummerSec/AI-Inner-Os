# Codex 适配

在 [OpenAI Codex CLI](https://github.com/openai/codex) 中启用 AI Inner OS。

## 安装

### 方式一：Codex 插件清单

仓库根目录包含正式 Codex 插件清单：

```text
.codex-plugin/plugin.json
```

清单直接引用现有 Codex hook 配置：

```json
{
  "hooks": "./codex/hooks.json"
}
```

仓库还包含 repo-scoped marketplace：

```text
.agents/plugins/marketplace.json
```

Codex 可从该 marketplace 发现 `ai-inner-os`，并从当前仓库根目录加载插件组件。

### 方式二：手动适配

#### 1. 复制 AGENTS.md

将 Inner OS 协议注入到你的全局或项目级指令中：

```bash
# 全局生效（所有项目）
cat codex/AGENTS.md >> ~/.codex/AGENTS.md

# 或项目级生效
cat codex/AGENTS.md >> ./AGENTS.md
```

#### 2. 配置 hooks

将 `codex/hooks.json` 的内容合并到你的 Codex hooks 配置中：

```bash
# 全局
cp codex/hooks.json ~/.codex/hooks.json

# 或项目级
cp codex/hooks.json .codex/hooks.json
```

> 注意：插件安装时从插件根目录解析 `./codex/hooks/*.js`；手动复制到 `~/.codex/hooks.json` 时，建议改成绝对路径，或使用 `node scripts/install.js --platform codex` 自动生成。

#### 3. 确认 hooks 功能已启用

在 `~/.codex/config.toml` 或项目级 `.codex/config.toml` 中确认：

```toml
[features]
codex_hooks = true
```

## Hook 生命周期

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动 | 初始化会话状态 |
| `PostToolUse` | 工具执行后 | 追踪事件，注入最近活动上下文 |
| `Stop` | 会话结束 | 清理状态文件 |

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
| Hook 数量 | 9 个 | 3 个 |
| 安装方式 | 插件市场一键安装 | Codex 插件清单 / 全局安装脚本 / 手动复制配置 |
