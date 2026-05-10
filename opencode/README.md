# OpenCode CLI 适配

在 [OpenCode CLI](https://github.com/opencode-ai/opencode) 中启用 AI Inner OS。

## 安装

正式用户只通过 OpenCode plugin package 安装。手动复制 instructions 或 `.opencode/plugins/inner-os.js` 仅用于本仓库开发调试，不作为正式安装或更新路径。

在 `opencode.json` 中声明插件包：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["ai-inner-os"]
}
```

## 工作原理

插件按 OpenCode 官方 plugin API 导出函数，并使用 `@opencode-ai/plugin` 的 `tool()` helper 注册 `inner-os` 自定义工具。

| 机制 | 文件 | 作用 |
|------|------|------|
| Plugin | `opencode/plugins/inner-os.js` | 注册 `inner-os` 自定义工具 |
| 静态副本 | `opencode/inner-os-rules.md` | 开发用协议副本，不作为用户安装方式 |
| 配置模板 | `opencode/opencode.json` | 开发用配置示例 |

## Persona（人设切换）

正式安装场景下，人设与频率应由 OpenCode 插件配置或插件工具管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode |
|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | SessionStart Hook | `.mdc` 规则 + hook | Plugin package |
| Hook 支持 | 9 个 | 3 个 | 3 个 | Plugin API |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 |
| 安装方式 | Marketplace | Plugin / marketplace | Plugin / marketplace | Plugin package |
| 配置格式 | JSON | Plugin manifest | Plugin manifest | JSON/JSONC |
