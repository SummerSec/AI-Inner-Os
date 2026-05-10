# Cursor Rules

这里存放 AI Inner OS 的 Cursor 规则文件。

- `inner-os-protocol.mdc`：`alwaysApply: true` 的协议规则，用于在 Cursor 会话中注入 Inner OS 输出约定。

该目录由 `.cursor-plugin/plugin.json` 通过 `rules: "./cursor/rules/"` 声明，可作为 Cursor 插件组件被发现。
