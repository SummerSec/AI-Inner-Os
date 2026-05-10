# OpenCode CLI 安装指南

在 [OpenCode CLI](https://github.com/opencode-ai/opencode) 中安装 AI Inner OS。

## 安装策略

正式用户只推荐通过 OpenCode plugin package 安装。这样发布新版本后，OpenCode 才能通过插件包版本拉取更新。

`node scripts/install.js --platform opencode`、手动复制 `.opencode/plugins/inner-os.js` 或 `inner-os-rules.md` 仅用于本仓库开发和本地调试，不作为正式安装路径。

## 安装步骤

在 OpenCode 配置中声明插件包：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["ai-inner-os"]
}
```

OpenCode 会在启动时安装并缓存 npm 插件包。发布新功能时，需要 bump 包版本并发布新包。

`opencode/plugins/inner-os.js` 使用 OpenCode 官方 plugin 函数导出和 `@opencode-ai/plugin` 的 `tool()` helper 注册自定义工具。

## 安装后验证

1. 启动一个新的 OpenCode 会话
2. AI 应在回复中自然出现 `▎InnerOS：...` 独白
3. 确认 `opencode.json` 中的 `plugin` 字段包含 `ai-inner-os`

## 工作原理

Inner OS 通过两个机制工作：

| 机制 | 文件 | 作用 |
|------|------|------|
| 指令文件 | `.opencode/inner-os-rules.md` | 注入 Inner OS 协议到系统 prompt |
| Plugin | `.opencode/plugins/inner-os.js` 或 `~/.config/opencode/plugins/inner-os.js` | 提供 `inner-os` 工具（状态查询、人设切换） |
| 配置 | `opencode.json` | 声明加载哪些指令文件 |

Plugin 提供的 `inner-os` 工具支持：
- `status` — 查看 Inner OS 状态
- `persona-list` — 列出所有可用人设
- `persona-use <name>` — 切换人设
- `persona-reset` — 恢复自由模式

正式安装必须通过 Plugin。静态 instructions 文件只是源码适配副本，不作为用户安装或更新方式。

## 文件说明

| 文件 | 作用 |
|------|------|
| `opencode/inner-os-rules.md` | Inner OS 协议（纯文本，无 YAML frontmatter） |
| `opencode/plugins/inner-os.js` | OpenCode Plugin（状态查询、人设切换工具） |
| `opencode/opencode.json` | 配置模板 |

## 人设切换（Persona）

正式安装场景下，人设与频率应由 OpenCode 插件配置或插件工具管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 可选用户人物画像

OpenCode 当前没有本仓库使用的 native skill 分发机制，因此用户人物画像能力作为插件文档能力提供：用户必须显式请求画像分析，并手动粘贴提示词或授权使用本地历史查询结果。插件不得自动采集历史或保存画像。持续进化模式也需显式开启，只在当前对话中维护版本化画像。

## 故障排查

### 无独白输出

1. 确认 `opencode.json` 存在且格式正确：

```bash
cat opencode.json
# 应包含 "plugin": ["ai-inner-os"]
```

2. 开始一个全新的会话

### 配置格式

OpenCode 支持 JSON 和 JSONC（带注释的 JSON）格式。确保 `opencode.json` 语法正确：

```bash
# 简单验证（Node.js）
node -e "require('./opencode.json')"
```

### 协议更新

协议更新通过 OpenCode plugin package 发布。不要通过手动复制 instructions 文件作为用户更新方式。
