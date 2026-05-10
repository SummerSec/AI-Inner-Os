# OpenClaw 安装指南

在 [OpenClaw](https://github.com/openclaw/openclaw) 中安装 AI Inner OS。

## 安装策略

正式用户只推荐通过 OpenClaw plugin / ClawHub 安装。这样 `openclaw.plugin.json` 的 `version` 更新后，OpenClaw 插件管理器才能识别新版内容。

手动复制 `openclaw/skills/inner-os` 到 workspace/global skills 目录，仅用于本仓库开发和本地调试，不作为正式安装或更新路径。

## 安装方式

按官方插件规范加载 `openclaw.plugin.json` 和 `package.json#openclaw` 中的 entrypoint：

```bash
openclaw plugins install clawhub:ai-inner-os
```

本地开发时可从仓库根目录安装：

```bash
openclaw plugins install .
```

安装后检查 runtime 注册：

```bash
openclaw plugins inspect ai-inner-os --runtime --json
```

原生插件会注册 `before_prompt_build` 和 `llm_output` hook，并把 `▎InnerOS：` 独白写入 `~/.inner-os/monologues/`。

## 配置

如需修改日志目录或触发频率，可在 OpenClaw 配置中设置：

```json5
{
  plugins: {
    entries: {
      "ai-inner-os": {
        config: {
          logPath: "/path/to/inner-os/logs",
          frequency: "high"
        }
      }
    }
  }
}
```

> **注意：** 非 bundled 插件如果需要读取原始模型输出，OpenClaw 可能要求在插件配置中开启 `hooks.allowConversationAccess: true`。

## 安装后验证

```bash
openclaw plugins inspect ai-inner-os --runtime --json
```

在会话中触发：

```text
/inner-os
```

## 文件说明

| 文件 | 作用 |
|------|------|
| `openclaw.plugin.json` | OpenClaw 原生插件 manifest |
| `package.json#openclaw` | OpenClaw entrypoint metadata |
| `openclaw/index.js` | OpenClaw 插件入口，使用 `definePluginEntry` |
| `openclaw/skills/inner-os/SKILL.md` | 随插件分发的 OpenClaw 兼容 skill |
| `openclaw/skills/user-profile-distillation/SKILL.md` | 可选用户人物画像 skill，需用户显式调用 |
| `openclaw/skills/agent-chat-history/` | 只读历史提示词查询 skill，供画像分析在获准后复用 |

## 人设切换（Persona）

正式安装场景下，人设与频率应由 OpenClaw 插件配置或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 可选用户人物画像

OpenClaw 插件通过 `openclaw.plugin.json` 的 `skills` 目录分发 `user-profile-distillation`。该 skill 默认关闭，只在用户明确请求画像分析时使用；本地历史读取必须先确认日期范围和来源，不会自动保存结果。持续进化模式也需显式开启，只在当前对话中维护版本化画像。

## 故障排查

### Plugin 未出现在列表中

1. 确认通过 `openclaw plugins install ...` 安装的是最新版本。
2. 运行 `openclaw plugins inspect ai-inner-os --runtime --json`。
3. 重启 OpenClaw Gateway。

### 协议更新

协议更新通过 OpenClaw plugin / ClawHub 版本发布。不要通过手动复制 Skill 作为用户更新方式。
