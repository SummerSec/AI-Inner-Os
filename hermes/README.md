# Hermes Agent 适配

在 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 中启用 AI Inner OS。

## 安装

有三种方式。需要自动注入每轮上下文时，优先使用 Hermes Plugin；只想按需触发时可使用 Skill。

### 方式一：Hermes Plugin

按 Hermes 官方插件规范安装：

```bash
mkdir -p ~/.hermes/plugins
cp -r hermes/plugins/inner-os ~/.hermes/plugins/inner-os
hermes plugins enable inner-os
```

插件会注册 `pre_llm_call` hook、`on_session_start` hook、`/inner-os` slash command，以及只读 bundled skill `plugin:inner-os`。

项目级插件也可放到 `.hermes/plugins/inner-os/`，但需要显式启用可信项目插件：

```bash
HERMES_ENABLE_PROJECT_PLUGINS=true hermes
```

### 方式二：Skill 安装

将 Inner OS 安装为 Hermes 技能，获得 `/inner-os` 斜杠命令支持：

```bash
# 复制技能目录到 Hermes skills 目录
cp -r hermes/skills/inner-os ~/.hermes/skills/personality/inner-os
```

安装后在 Hermes 会话中即可使用：

```
/inner-os
```

或通过自然语言调用：

```
hermes chat --toolsets skills -q "启用 inner-os 技能"
```

也可以配置外部技能目录，避免复制：

```yaml
# ~/.hermes/config.yaml
skills:
  external_dirs:
    - /path/to/AI-Inner-Os/hermes/skills
```

### 方式三：Context File（项目级）

将 Inner OS 协议作为项目上下文文件注入：

```bash
# 复制到项目根目录（Hermes 优先识别 .hermes.md）
cp hermes/hermes.md ./.hermes.md
```

Hermes 启动时会自动发现并加载 `.hermes.md`，将协议注入系统 prompt。

## 工作原理

Hermes Agent 不支持外部 JS hook 脚本，通过 Python 插件、Skill 或 Context File 实现协议注入：

| 机制 | 文件 | 作用 |
|------|------|------|
| Plugin | `plugins/inner-os/plugin.yaml` + `__init__.py` | 注册 Hermes hooks、slash command、bundled skill |
| Skill | `skills/inner-os/SKILL.md` | 按需加载协议，提供 `/inner-os` 命令 |
| Context File | `hermes.md` → `.hermes.md` | 项目级静态注入到系统 prompt |

### Skill vs Context File

| | Plugin | Skill | Context File |
|---|---|---|---|
| 加载方式 | 插件启用后通过 hook 自动注入 | 按需（slash command 或 agent 自行调用） | 每次会话自动加载 |
| Token 消耗 | 每轮注入协议 | 渐进式加载，仅在需要时注入 | 每轮都占用 context |
| 适用场景 | 全局启用且需要 hook/命令 | 全局按需启用，跨项目 | 单项目绑定 |
| 安装位置 | `~/.hermes/plugins/` | `~/.hermes/skills/` | 项目根目录 `.hermes.md` |

## 与其他平台的差异

| | Claude Code | Codex CLI | Cursor | OpenCode | Hermes Agent |
|---|---|---|---|---|---|
| 协议注入 | Hook 读取 SKILL.md | AGENTS.md | `.mdc` 规则 | instructions 指令文件 | Plugin、Skill 或 `.hermes.md` |
| Hook 支持 | 9 个 | 3 个 | 3 个 | 无 | Python 插件 hooks |
| 失败追踪 | PostToolUseFailure | 不支持 | 不支持 | 不支持 | 不支持 |
| 安装方式 | 插件市场 | 手动复制 | 复制 .mdc | 复制指令文件 | Plugin / Skill / Context File |
| 斜杠命令 | `/inner-os`（命令） | 无 | 无 | 无 | `/inner-os`（Skill） |
