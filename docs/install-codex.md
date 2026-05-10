# Codex CLI 安装指南

在 [OpenAI Codex CLI](https://github.com/openai/codex) 中安装 AI Inner OS。

## 安装策略

正式用户只推荐通过 Codex plugin / marketplace 安装。这样 `.codex-plugin/plugin.json` 的 `version` 更新后，Codex 插件缓存才能识别新版内容。

全局安装脚本、手动追加 `AGENTS.md`、手动复制 `hooks.json` 仅用于本仓库开发和本地调试，不作为正式安装路径。

## 安装步骤

仓库根目录包含 Codex 插件清单和 repo-scoped marketplace：

```text
.codex-plugin/plugin.json
.agents/plugins/marketplace.json
```

插件清单引用现有 Codex hook 配置：

```json
{
  "hooks": "./codex/hooks.json"
}
```

Codex 可从 `.agents/plugins/marketplace.json` 发现并安装 `ai-inner-os`。修改插件文件后，重启 Codex 以加载更新后的插件缓存。

> 注意：如果当前 `codex --help` 中没有 `plugin` 子命令，请先升级 Codex CLI。不要把手动 hooks 配置作为用户更新方案。

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
| Hook 数量 | 9 个 | 3 个 |
| 工具覆盖 | 所有工具 | 仅 Bash |
| 安装方式 | 插件市场一键安装 | Codex plugin / marketplace |
| 路径解析 | `${CLAUDE_PLUGIN_ROOT}` 自动解析 | 安装脚本生成绝对路径 |

## 文件说明

| 文件 | 作用 |
|------|------|
| `codex/AGENTS.md` | Inner OS 协议（追加到 Codex 指令文件） |
| `codex/hooks.json` | Hook 注册配置（`SessionStart` + `PostToolUse` + `Stop`） |
| `codex/hooks/session-start.js` | 会话启动：读取协议和人设，输出开发者上下文 |
| `codex/hooks/post-tool-use.js` | Bash 执行后：追踪事件，输出 JSON 上下文 |
| `codex/hooks/session-stop.js` | 会话结束：清理状态文件 |
| `.codex-plugin/plugin.json` | Codex 插件清单 |
| `.agents/plugins/marketplace.json` | Codex repo-scoped marketplace |

所有 hook 脚本通过相对路径引用 `hooks/lib/` 中的共享逻辑。

## 人设切换（Persona）

正式安装场景下，人设与频率应由 Codex 插件配置或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本，不作为用户安装或更新流程。

## 故障排查

### 无独白输出

1. 确认 Codex 已安装并启用 `ai-inner-os` 插件
2. 确认插件版本是最新发布版本
3. 重启 Codex 以刷新插件缓存

### 协议更新

协议更新通过 Codex plugin / marketplace 发布。不要通过手动追加 `AGENTS.md` 作为用户更新方式。
