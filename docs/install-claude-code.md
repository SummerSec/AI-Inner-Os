# Claude Code 安装指南

在 [Claude Code](https://claude.ai/code) 中安装 AI Inner OS。这是功能最完整的平台，拥有 6 个生命周期 hook。

## 前置条件

- Claude Code CLI 已安装
- Node.js >= 18

## 安装方式

### 方式一：插件市场安装（默认）

```bash
# 添加第三方 marketplace
/plugin marketplace add SummerSec/AI-Inner-Os

# 或使用 Git URL 格式
/plugin marketplace add https://github.com/SummerSec/AI-Inner-Os.git

# 安装插件
/plugin install ai-inner-os

# 在当前会话立即生效
/reload-plugins
```

### 方式二：本地开发安装

如果你克隆了仓库并希望从本地目录安装：

```bash
# 克隆仓库
git clone https://github.com/SummerSec/AI-Inner-Os.git
cd AI-Inner-Os

# 从本地目录安装插件
/plugin install /path/to/AI-Inner-Os
/reload-plugins
```

## 安装后验证

1. 开始一个新会话或执行 `/reload-plugins`
2. AI 应当在回复中自然地出现 `▎InnerOS：...` 格式的独白
3. 如果没有出现，检查插件是否已启用：

```
/plugin list
```

## 配置自动更新

第三方 marketplace 默认不自动更新。推荐开启：

1. 进入 `/plugin` → Marketplaces 标签页
2. 找到 `SummerSec/AI-Inner-Os`
3. 开启 auto-update

或手动更新：

```
/plugin marketplace update SummerSec/AI-Inner-Os
/plugin update ai-inner-os
```

## Hook 生命周期

Claude Code 版本拥有最完整的 hook 支持：

```
SessionStart → 注入 Inner OS 协议
       ↓
PreToolUse → 注入工具执行前上下文
       ↓
工具执行
       ↓
PostToolUse (成功) → 追踪事件，注入最近活动
PostToolUseFailure (失败) → 追踪失败，注入错误上下文
       ↓
PreCompact → 保存状态
       ↓
Stop → 清理状态
```

| Hook | 触发时机 | 作用 |
|------|---------|------|
| `SessionStart` | 会话启动/恢复/压缩 | 从 `SKILL.md` 读取并注入协议 |
| `PreToolUse` | 工具执行前 | 注入工具名称、目标、重试提示 |
| `PostToolUse` | 工具执行成功后 | 追踪事件，注入最近活动上下文 |
| `PostToolUseFailure` | 工具执行失败后 | 追踪失败，注入错误上下文和连续失败计数 |
| `PreCompact` | 上下文压缩前 | 保存状态，维持协议连续性 |
| `Stop` | 会话结束 | 清理状态文件 |

## 文件说明

| 文件 | 作用 |
|------|------|
| `hooks/hooks.json` | Hook 注册清单（使用 `${CLAUDE_PLUGIN_ROOT}` 路径变量） |
| `hooks/session-start.js` | 读取 `SKILL.md`，注入协议到 `additionalContext` |
| `hooks/pre-tool-use.js` | 生成工具执行前上下文 |
| `hooks/post-tool-use.js` | 归一化事件，更新状态 |
| `hooks/post-tool-use-failure.js` | 追踪失败事件 |
| `hooks/pre-compact.js` | 压缩前保存状态 |
| `hooks/stop.js` | 清理会话状态文件 |
| `hooks/lib/` | 共享逻辑（状态管理、事件归一化、prompt 拼装等） |
| `protocol/SKILL.md` | Inner OS 行为协议（唯一数据源） |
| `.claude-plugin/plugin.json` | 插件元信息 |
| `.claude-plugin/marketplace.json` | 本地 marketplace 注册 |

## 故障排查

### 插件安装后无效果

```bash
# 检查插件状态
/plugin list

# 重新加载
/reload-plugins

# 检查 hooks 是否注册
# 观察会话启动时是否有 Inner OS 相关的 hook 输出
```

### Hook 报错

所有 hook 脚本都包含 `try/catch` 保护，出错时静默失败不会中断会话。如需调试：

```bash
# 手动运行 hook 脚本检查语法
node --check hooks/session-start.js
node --check hooks/pre-tool-use.js

# 或运行全部检查
npm run check
```

### 状态文件

会话状态文件存储在 `state/` 目录（已 gitignore），按会话 ID 命名。如遇状态异常，可安全删除：

```bash
rm -f state/*.json
```
