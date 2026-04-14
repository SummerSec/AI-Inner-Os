# OpenCode CLI 安装指南

在 [OpenCode CLI](https://github.com/opencode-ai/opencode) 中安装 AI Inner OS。

## 前置条件

- OpenCode CLI 已安装
- 一个打开的项目目录

## 安装步骤

### 第一步：复制指令文件

```bash
mkdir -p .opencode
cp opencode/inner-os-rules.md .opencode/inner-os-rules.md
```

### 第二步：配置 opencode.json

在项目根目录的 `opencode.json` 中声明加载指令文件：

**如果还没有 opencode.json：**

```bash
cp opencode/opencode.json ./opencode.json
```

**如果已有 opencode.json：**

手动添加 `instructions` 字段：

```json
{
  "instructions": [".opencode/inner-os-rules.md"]
}
```

如果已有 `instructions` 数组，将路径追加进去：

```json
{
  "instructions": [
    "existing-instructions.md",
    ".opencode/inner-os-rules.md"
  ]
}
```

## 安装后验证

1. 启动一个新的 OpenCode 会话
2. AI 应在回复中自然出现 `▎InnerOS：...` 独白
3. 确认 `opencode.json` 中的路径指向正确的文件

## 工作原理

OpenCode CLI 不支持 hooks。Inner OS 通过 `instructions` 配置将协议静态注入到系统 prompt。

| 机制 | 文件 | 作用 |
|------|------|------|
| 指令文件 | `.opencode/inner-os-rules.md` | 注入 Inner OS 协议到系统 prompt |
| 配置 | `opencode.json` | 声明加载哪些指令文件 |

### 局限性

由于没有 hook 支持，OpenCode 版本：

- 无工具执行前后的上下文追踪
- 无连续失败计数
- 无会话状态管理
- 协议为纯静态注入，每次对话都从系统 prompt 加载

独白功能本身不受影响——AI 仍然可以正常输出 `▎InnerOS：...` 格式的独白。

## 文件说明

| 文件 | 作用 |
|------|------|
| `opencode/inner-os-rules.md` | Inner OS 协议（纯文本，无 YAML frontmatter） |
| `opencode/opencode.json` | 配置模板 |

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
cp opencode/inner-os-rules.md .opencode/
```

> **提示：** 每次切换人设后都需要重新复制指令文件。

## 故障排查

### 无独白输出

1. 确认 `opencode.json` 存在且格式正确：

```bash
cat opencode.json
# 应包含 "instructions": [".opencode/inner-os-rules.md"]
```

2. 确认指令文件存在：

```bash
cat .opencode/inner-os-rules.md
# 应包含 Inner OS 协议内容
```

3. 开始一个全新的会话

### 配置格式

OpenCode 支持 JSON 和 JSONC（带注释的 JSON）格式。确保 `opencode.json` 语法正确：

```bash
# 简单验证（Node.js）
node -e "require('./opencode.json')"
```

### 协议更新

当上游更新后：

```bash
cp opencode/inner-os-rules.md .opencode/inner-os-rules.md
```
