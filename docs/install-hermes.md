# Hermes Agent 安装指南

在 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 中安装 AI Inner OS。

## 安装策略

正式用户只推荐通过 Hermes plugin 安装。这样 `hermes/plugins/inner-os/plugin.yaml` 的 `version` 更新后，Hermes 插件管理流程才能识别新版内容。

手动复制 Skill、外部 skill 目录、`.hermes.md` context file 仅用于本仓库开发和本地调试，不作为正式安装或更新路径。

## 安装方式

Hermes 原生插件位于 `hermes/plugins/inner-os/`，包含 `plugin.yaml`、`__init__.py` 和随插件分发的 Skill。

```bash
mkdir -p ~/.hermes/plugins
cp -r hermes/plugins/inner-os ~/.hermes/plugins/inner-os
hermes plugins enable inner-os
```

项目级插件也可以放到 `.hermes/plugins/inner-os/`，但 Hermes 默认禁用项目级插件。只在可信仓库中启用：

```bash
mkdir -p .hermes/plugins
cp -r hermes/plugins/inner-os .hermes/plugins/inner-os
HERMES_ENABLE_PROJECT_PLUGINS=true hermes
```

如需提高频率，可在启动 Hermes 前设置环境变量：

```bash
INNER_OS_FREQUENCY=high hermes
```

## 安装后验证

插件启用后在 Hermes 会话中执行：

```text
/inner-os
```

应看到 Inner OS 状态、独白前缀和当前频率。

## 工作原理

Hermes 插件注册：

- `pre_llm_call` hook：向每轮模型调用注入 Inner OS 协议
- `on_session_start` hook：会话生命周期占位
- `/inner-os` slash command：显示插件状态
- bundled plugin skills：通过 Hermes plugin skill 机制按需查看 Inner OS、历史查询和用户画像 skill

## 文件说明

| 文件 | 作用 |
|------|------|
| `hermes/plugins/inner-os/plugin.yaml` | Hermes 原生插件 manifest |
| `hermes/plugins/inner-os/__init__.py` | Hermes 插件注册入口 |
| `hermes/plugins/inner-os/skills/inner-os/SKILL.md` | 随插件分发的只读 skill |
| `hermes/plugins/inner-os/skills/user-profile-distillation/SKILL.md` | 可选用户人物画像 skill，需用户显式调用 |
| `hermes/plugins/inner-os/skills/agent-chat-history/` | 只读历史提示词查询 skill，供画像分析在获准后复用 |
| `hermes/skills/inner-os/SKILL.md` | 开发用 standalone skill 副本 |
| `hermes/skills/user-profile-distillation/SKILL.md` | 开发用 standalone 用户画像 skill 副本 |
| `hermes/hermes.md` | 开发用项目级 context file 副本 |

## 人设切换（Persona）

正式安装场景下，人设与频率应由 Hermes 插件配置、环境变量或插件命令管理。仓库内 `scripts/switch-persona.js` 只用于维护静态适配副本。

## 可选用户人物画像

Hermes 插件会注册 `user-profile-distillation` bundled skill，但不会自动启用。只有用户明确要求画像分析时才使用；读取本地历史前必须确认日期范围和来源，输出仅限工作画像、沟通偏好和不确定性说明。持续进化模式也需显式开启，只在当前对话中维护版本化画像。

## 故障排查

### Plugin 未被发现

1. 确认 `~/.hermes/plugins/inner-os/plugin.yaml` 存在。
2. 确认已执行 `hermes plugins enable inner-os`。
3. 重启 Hermes 会话。

### 协议更新

协议更新通过 Hermes plugin 版本发布。不要通过手动复制 Skill 或 context file 作为用户更新方式。
