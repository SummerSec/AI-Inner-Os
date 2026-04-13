# AI Inner OS

> 让 AI 在终端工作时"活起来"——把内心独白展示出来。

<p align="center">
  <img src="docs/pic/inneros.jpg" width="600" />
</p>

AI Inner OS 是一个 Claude Code 插件。它通过 hook 注入，让 AI 在正常完成任务的同时，可以额外输出一层可见的自由独白：

```
▎InnerOS：这仓库现在还像毛坯房，先把承重墙立起来再说。
```

不预设人格，不限制语气。AI 可以吐槽、得意、焦虑、冷笑、跳跃联想——或者什么都不说。独白是否出现，由 AI 自己决定。

## 安装

```bash
# 添加 marketplace
claude plugin marketplace add SummerSec/AI-Inner-Os

# 安装插件
claude plugin install ai-inner-os
```

安装后重启会话即可生效，无需手动配置。

## 工作原理

插件通过 Claude Code 的 hook 生命周期自动注入 Inner OS 协议：

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动/恢复/压缩 | 从 SKILL.md 读取并注入 Inner OS 协议 |
| `PreToolUse` | 工具执行前 | 注入即将执行的工具上下文（名称、目标、失败重试提示） |
| `PostToolUse` | 工具执行成功后 | 追踪事件，注入最近活动上下文 |
| `PostToolUseFailure` | 工具执行失败后 | 追踪失败事件，注入错误上下文和连续失败计数 |
| `PreCompact` | 上下文压缩前 | 保存状态，维持协议连续性 |
| `Stop` | 会话结束 | 清理状态文件 |

完整的工具使用生命周期：

```
PreToolUse → 工具执行 → PostToolUse (成功)
                       → PostToolUseFailure (失败)
```

## 协议设计

Inner OS 的行为协议定义在 [`skills/inner-os/SKILL.md`](skills/inner-os/SKILL.md)，这是唯一的数据源。SessionStart hook 和 `/inner-os` skill 都从这个文件读取。

核心原则：

- **不扮演固定人设**——没有预设语气表，AI 自行决定表达风格
- **主任务优先**——独白不能替代实际交付内容
- **独白可选**——是否输出由 AI 自己判断
- **格式统一**——使用 `▎InnerOS：` 前缀

## 项目结构

```
.
├── .claude-plugin/          # Claude Code 插件元信息
│   ├── plugin.json
│   └── marketplace.json
├── hooks/                   # 生命周期 hook 脚本
│   ├── hooks.json           # hook 注册清单
│   ├── session-start.js
│   ├── pre-tool-use.js
│   ├── post-tool-use.js
│   ├── post-tool-use-failure.js
│   ├── pre-compact.js
│   ├── stop.js
│   └── lib/                 # 共享逻辑
│       ├── constants.js     # 插件 ID、前缀、路径、枚举
│       ├── events.js        # 工具事件归一化与分类
│       ├── prompt.js        # 协议读取与上下文构建
│       ├── state.js         # 会话状态读写
│       ├── session.js       # 会话 ID 提取
│       ├── format.js        # 输出格式
│       └── io.js            # stdin/stdout I/O
├── skills/
│   └── inner-os/
│       └── SKILL.md         # Inner OS 行为协议（唯一数据源）
├── commands/
│   └── inner-os.md          # /inner-os 调试命令（占位）
├── tests/                   # 单元测试
├── codex/                   # Codex 适配（占位）
├── cursor/                  # Cursor 适配（占位）
├── state/                   # 运行时会话状态（gitignored）
└── plugin.json              # 仓库级插件元信息
```

## 开发

```bash
# 语法检查
npm run check

# 运行测试
npm test
```

Node.js >= 18，ESM 模块。

## 路线图

- [ ] 实现 `/inner-os` 子命令（status / on / off / reload）
- [ ] 适配 Codex
- [ ] 适配 Cursor

## 许可证

[Apache-2.0](LICENSE)
