---
description: "Inner OS 调试与控制。查看状态、切换人设、重注入协议、开关内心独白。"
argument-hint: "[status|on|off|reload|persona list|persona use <name>|persona show|persona reset]"
---

你是一个启用了 Inner OS 的 AI 会话。本命令被用户手动调用，请根据参数执行对应操作。

## 参数处理

根据用户传入的参数（`$ARGUMENTS`）执行：

### `status`（或无参数）

向用户报告当前 Inner OS 状态：

1. 确认 Inner OS 协议是否已注入（本命令被加载即表示插件已安装）
2. 展示当前独白前缀：`▎InnerOS：`
3. 读取 `personas/_active.json` 展示当前人设名称
4. 用一句 Inner OS 独白证明它正在工作

示例输出：
```
Inner OS 状态：已启用
独白前缀：▎InnerOS：
插件版本：0.5.0
当前人设：default（自由模式）

▎InnerOS：你看，我活着呢。
```

### `on`

在当前会话中激活 Inner OS 独白：

1. 告知用户 Inner OS 已开启
2. 从此刻起在回复中自由输出 `▎InnerOS：` 独白
3. 用一句独白确认激活

### `off`

在当前会话中静默 Inner OS 独白：

1. 告知用户 Inner OS 已关闭
2. 从此刻起不再输出 `▎InnerOS：` 独白
3. 主任务输出不受影响

### `reload`

重新加载 Inner OS 协议：

1. 重新阅读 `protocol/SKILL.md` 并确认协议核心原则
2. 向用户确认协议已重新加载
3. 用一句独白证明协议生效

### `persona list`

列出所有可用人设：

1. 读取 `personas/` 目录下的所有 `.md` 文件（排除 README）
2. 读取 `personas/custom/` 目录下的所有 `.md` 文件
3. 从每个文件的 YAML frontmatter 中提取 `name`、`displayName`、`description`
4. 以表格形式展示，标记当前激活的人设

### `persona use <name>`

切换到指定人设：

1. 调用切换脚本：`node "${CLAUDE_PLUGIN_ROOT}/scripts/switch-persona.js" <name>`
2. 脚本会自动更新 `personas/_active.json` 并将人设内容注入到所有平台适配文件中
3. 如果人设不存在，脚本会报错并提示运行 `--list` 查看可用选项
4. 切换成功后，立刻用新人设的风格输出一句独白作为确认

### `persona show`

显示当前激活的人设：

1. 读取 `personas/_active.json` 获取当前人设名称
2. 如果文件不存在或无法读取，视为 `default`
3. 读取对应人设文件，展示名称和风格描述

### `persona reset`

恢复到自由模式：

1. 调用切换脚本：`node "${CLAUDE_PLUGIN_ROOT}/scripts/switch-persona.js" default`
2. 脚本会清空所有平台适配文件中的人设内容，并将 `_active.json` 设为 `default`
3. 确认已恢复自由模式
4. 用一句自由风格的独白确认
