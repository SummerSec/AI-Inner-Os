# OpenCode CLI 适配

在 [OpenCode CLI](https://github.com/opencode-ai/opencode) 中启用 AI Inner OS。

## 安装

### 1. 复制指令文件

```bash
mkdir -p .opencode
cp opencode/inner-os-rules.md .opencode/inner-os-rules.md
```

### 2. 配置 opencode.json

在项目根目录的 `opencode.json` 中添加 instructions：

```json
{
  "instructions": [".opencode/inner-os-rules.md"]
}
```

或者合并到已有配置中：

```bash
# 如果还没有 opencode.json
cp opencode/opencode.json ./opencode.json

# 如果已有，手动将 instructions 字段合并进去
```

### 3. 安装 OpenCode Plugin（可选）

插件按 OpenCode 官方 plugin API 导出函数，并使用 `@opencode-ai/plugin` 的 `tool()` helper 注册 `inner-os` 自定义工具：

```bash
# 项目级 Plugin
mkdir -p .opencode/plugins
cp opencode/plugins/inner-os.js .opencode/plugins/

# 或全局 Plugin
mkdir -p ~/.config/opencode/plugins
cp opencode/plugins/inner-os.js ~/.config/opencode/plugins/
```

## 工作原理

OpenCode 通过 `instructions` 配置静态注入 Inner OS 协议；可选 Plugin 提供 `inner-os` 工具用于状态查询和人设切换。

| 机制 | 文件 | 作用 |
|------|------|------|
| 指令文件 | `inner-os-rules.md` | 注入 Inner OS 协议到系统 prompt |
| Plugin | `plugins/inner-os.js` | 注册 `inner-os` 自定义工具 |
| 配置 | `opencode.json` | 声明加载哪些指令文件 |

## Persona（人设切换）

OpenCode 使用静态指令文件注入协议。安装 Plugin 后可以通过 `inner-os` 工具执行 `persona-list`、`persona-use <name>`、`persona-reset`；未安装 Plugin 时，请将 `personas/<name>.md` 的正文内容手动追加到 `opencode/inner-os-rules.md` 文件末尾。

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode |
|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | AGENTS.md | `.mdc` 规则 | instructions 指令文件 |
| Hook 支持 | 9 个 | 3 个 | 3 个 | 无 |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 |
| 安装方式 | 插件市场 | 手动复制 | 复制 .mdc | 复制指令文件 + 配置 |
| 配置格式 | JSON | TOML + JSON | JSON | JSON/JSONC |
