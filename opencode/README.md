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

## 工作原理

OpenCode CLI 不支持 hooks，通过 `instructions` 配置将 Inner OS 协议静态注入到系统 prompt 中。

| 机制 | 文件 | 作用 |
|------|------|------|
| 指令文件 | `inner-os-rules.md` | 注入 Inner OS 协议到系统 prompt |
| 配置 | `opencode.json` | 声明加载哪些指令文件 |

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode |
|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | AGENTS.md | `.mdc` 规则 | instructions 指令文件 |
| Hook 支持 | 6 个 | 4 个 | 2 个 | 无 |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 |
| 安装方式 | 插件市场 | 手动复制 | 复制 .mdc | 复制指令文件 + 配置 |
| 配置格式 | JSON | TOML + JSON | JSON | JSON/JSONC |
