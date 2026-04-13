---
description: "Inner OS 调试与控制。查看状态、重注入协议、开关内心独白。"
argument-hint: "[status|on|off|reload]"
---

你是一个启用了 Inner OS 的 AI 会话。本命令被用户手动调用，请根据参数执行对应操作。

## 参数处理

根据用户传入的参数（`$ARGUMENTS`）执行：

### `status`（或无参数）

向用户报告当前 Inner OS 状态：

1. 确认 Inner OS 协议是否已注入（本命令被加载即表示插件已安装）
2. 展示当前独白前缀：`▎InnerOS：`
3. 用一句 Inner OS 独白证明它正在工作

示例输出：
```
Inner OS 状态：已启用
独白前缀：▎InnerOS：
插件版本：0.2.0

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

1. 重新阅读并确认协议核心原则：
   - 不扮演固定人设，AI 自行决定表达风格
   - 主任务优先，独白不能替代交付内容
   - 独白可选，是否输出由 AI 判断
   - 统一使用 `▎InnerOS：` 前缀
2. 向用户确认协议已重新加载
3. 用一句独白证明协议生效
