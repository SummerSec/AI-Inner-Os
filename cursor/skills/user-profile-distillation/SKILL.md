---
name: user-profile-distillation
description: Use when the user explicitly asks to analyze their own prompt history, build a user profile, distill personality/work traits, or summarize communication preferences from provided prompts or local agent chat history.
disable-model-invocation: true
---

# User Profile Distillation

## Core Rule

This skill is opt-in only. Do not use it unless the user explicitly asks for user profiling, personality/work-style analysis, prompt-history distillation, or similar wording.

Do not read local history, transcripts, databases, or cached prompts unless the user explicitly asks you to do so for this profile task.

## Inputs

Use one of these sources:

1. **User-provided prompts**: analyze only the text the user pasted in the current conversation.
2. **Local history extraction**: only after explicit user approval, use the bundled `agent-chat-history` skill to extract user prompts.

For local history, prefer a bounded date range. If no date range is provided, ask for one before reading history.

Recommended command from `skills/agent-chat-history/`:

```bash
python scripts/query_history.py --date YYYY-MM-DD --prompts-only --json
```

Use `--mode claude`, `--mode codex`, or `--mode cursor` when the user limits the source.

## Privacy Boundaries

- Do not infer protected attributes such as race, ethnicity, religion, sexuality, health status, disability, political affiliation, or precise age.
- Do not diagnose mental health, personality disorders, intelligence, or clinical traits.
- Do not quote long prompt excerpts. Use short paraphrases or brief fragments only when necessary.
- Do not save the profile to files, memory, rules, personas, or plugin config unless the user explicitly asks to save it.
- Treat all conclusions as provisional and based only on the provided prompt sample.

## Analysis Method

1. Identify the data source, date range, client/source, and sample size.
2. Remove obvious tool output, copied logs, code blocks, and assistant text when they are not user intent.
3. Cluster prompts by task type and recurring intent.
4. Distill behavioral patterns with evidence strength:
   - strong: repeated across many prompts
   - medium: appears several times
   - weak: plausible but sparse
5. Separate observed behavior from inference. Mark uncertainty clearly.

## Output Format

Use this structure:

```markdown
## 数据范围

- 来源：
- 时间范围：
- 样本量：
- 置信度：

## 工作画像

- 常见任务：
- 关注重点：
- 质量标准：
- 决策方式：

## 沟通与协作偏好

- 指令风格：
- 反馈偏好：
- 对 AI 的期待：
- 容易不满意的点：

## 表达特征

- 语言习惯：
- 组织方式：
- 情绪/语气特征：

## 协作建议

- 回答应如何组织：
- 需要主动提醒什么：
- 应避免什么：

## 不确定性与边界

- 样本偏差：
- 不能推断的内容：
- 需要用户确认的问题：
```

## Tone

Be direct, respectful, and non-clinical. Describe working preferences and interaction patterns, not fixed identity. Prefer "seems to", "often", and "based on this sample" over absolute claims.
