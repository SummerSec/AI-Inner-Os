# AI Inner OS Architecture

## 目标

`AI-Inner-Os` 的第一版目标，是在 `Claude Code` 中通过插件与 hook 机制，为 AI 注入一个可公开展示的独白层。

这个项目不尝试暴露模型的真实隐藏推理，而是通过协议注入的方式，让 AI 可以在完成主任务的同时，以 `▎InnerOS：...` 的格式输出自由风格的可见旁白。

## 设计原则

- 参考 `pua` 的仓库组织方式，先搭好多平台扩展骨架
- 第一版只真正实现 `Claude Code`
- 主入口是自动 hook，而不是手动命令
- 不预设语气表，让 AI 自己决定表达风格
- 主任务优先，独白是附加层，不是替代层

## 目录职责

- `plugin.json`：仓库级插件元信息
- `.claude-plugin/plugin.json`：Claude Code 插件元信息
- `.claude-plugin/marketplace.json`：Claude Code 本地市场元信息
- `hooks/`：会话生命周期脚本
- `hooks/hooks.json`：Claude Code hook 注册清单
- `hooks/lib/`：状态管理、事件归一化、prompt 拼装、格式常量
- `protocol/SKILL.md`：Inner OS 行为协议
- `commands/inner-os.md`：手动调试入口占位
- `state/`：按会话写入的轻量状态文件
- `codex/`、`cursor/`：后续多平台适配占位

## Hook 生命周期

### `SessionStart`

- 初始化会话状态
- 通过 `hookSpecificOutput.additionalContext` 注入 Inner OS 协议
- 明确允许公开展示内心独白

### `PostToolUse`

- 接收工具执行事件
- 归一化工具名称、结果和对象
- 更新会话状态
- 注入最近发生的事实层上下文

### `PreCompact`

- 在压缩前保存轻量状态
- 保持 Inner OS 协议的连续性

### `Stop`

- 清理状态文件

## 输出协议

默认的可见独白前缀为：

`▎InnerOS：`

协议只规定这个前缀，不规定人格、语气或措辞。AI 可以根据上下文自行决定是否输出独白，以及用什么风格输出。

## 当前范围

第一版当前已经对齐到更接近 `pua` 的 Claude Code 插件布局。当前重点是：

- 先把仓库结构搭对
- 先把 hook 数据流闭环搭出来
- 先把 Inner OS 行为协议固定下来

后续再补：

- Claude Code 实际安装与加载验证
- 手动命令开关
- 多平台适配
- 更细的显示与状态控制
