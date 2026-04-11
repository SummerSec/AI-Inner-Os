---
description: "Inner OS 调试入口。用于检查或强调当前会话允许公开输出 `▎InnerOS：...` 风格的内心独白。"
argument-hint: "[status|on|off|reload]"
---

这个命令是 `AI-Inner-Os` 的手动调试入口。

当前第一版以自动 hook 注入为主，这个命令先作为占位和调试说明存在。

## 预期能力

- `status`：查看当前会话是否启用 Inner OS
- `on`：手动开启 Inner OS
- `off`：手动关闭 Inner OS
- `reload`：重新注入当前会话的 Inner OS 协议

## 当前状态

这些子命令还没有全部实现，当前仓库提供的是 Claude Code 插件基础框架与 hook 骨架。
