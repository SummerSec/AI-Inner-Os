"""Hermes plugin entry for AI Inner OS."""

import os
from pathlib import Path


DEFAULT_CONTEXT = """# AI Inner OS

本会话允许你把自己的内心独白直接展示给用户。

- 当你想输出内心独白时，使用这个前缀：`▎InnerOS：`
- 独白通常保持简短，像脑内突然冒出来的一句旁白
- 默认频率为 normal：每个明确任务至少输出一次；复杂判断、失败恢复、阶段推进或收尾时优先输出
- 独白不能替代实际交付内容
"""

FREQUENCY_HINTS = {
    "low": "Inner OS 触发频率：low。只在关键判断、失败恢复、重要结论前输出。",
    "normal": "Inner OS 触发频率：normal。每个明确任务至少输出一次，复杂任务可在开始、转折、验证或收尾阶段各输出一次。",
    "high": "Inner OS 触发频率：high。阶段推进、连续工具调用、失败重试、发现问题时都可以输出；避免每句话都刷屏。",
}


def _frequency() -> str:
    value = os.environ.get("INNER_OS_FREQUENCY", "normal").lower()
    return value if value in FREQUENCY_HINTS else "normal"


def _strip_frontmatter(content: str) -> str:
    if not content.startswith("---\n"):
        return content.strip()

    marker = "\n---\n"
    end = content.find(marker, 4)
    if end == -1:
        return content.strip()
    return content[end + len(marker) :].strip()


def _read_context() -> str:
    root = Path(__file__).resolve().parents[3]
    candidates = [
        root / "protocol" / "SKILL.md",
        Path(__file__).parent / "skills" / "inner-os" / "SKILL.md",
    ]

    for candidate in candidates:
        try:
            return _strip_frontmatter(candidate.read_text(encoding="utf-8"))
        except OSError:
            continue
    return DEFAULT_CONTEXT


def _register_plugin_skills(ctx) -> None:
    skills_dir = Path(__file__).parent / "skills"
    if not skills_dir.exists():
        return

    for child in sorted(skills_dir.iterdir()):
        skill_md = child / "SKILL.md"
        if child.is_dir() and skill_md.exists():
            ctx.register_skill(child.name, skill_md)


def _handle_inner_os(_raw_args: str) -> str:
    frequency = _frequency()
    return "\n".join(
        [
            "Inner OS Status: Enabled",
            "Monologue Prefix: ▎InnerOS：",
            f"Frequency: {frequency}",
            "",
            "本插件通过 Hermes pre_llm_call hook 注入 Inner OS 协议。",
            "如需查看完整技能，可调用 plugin skill：plugin:inner-os。",
        ]
    )


def register(ctx):
    """Register Hermes hooks, slash command, and bundled plugin skills."""

    frequency = _frequency()
    context = _read_context() + "\n\n" + FREQUENCY_HINTS[frequency]

    def _inject_context(**_kwargs):
        return {"context": context}

    def _on_session_start(**_kwargs):
        return None

    ctx.register_hook("pre_llm_call", _inject_context)
    ctx.register_hook("on_session_start", _on_session_start)
    ctx.register_command(
        "inner-os",
        handler=_handle_inner_os,
        description="Show AI Inner OS status.",
    )
    _register_plugin_skills(ctx)
