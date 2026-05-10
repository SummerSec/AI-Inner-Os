---
name: user-profile-distillation
description: Use when the user explicitly asks to analyze their own prompt history, build a user profile, distill personality/work traits, or summarize communication preferences from provided prompts or local agent chat history.
disable-model-invocation: true
---

# User Profile Distillation

## Core Rule

This skill is opt-in only. Do not use it unless the user explicitly asks for user profiling, personality/work-style analysis, prompt-history distillation, continuous profile evolution, or similar wording.

Do not read local history, transcripts, databases, or cached prompts unless the user explicitly asks you to do so for this profile task.

Continuous evolution is also opt-in. Do not silently update a profile across turns unless the user explicitly asks to keep refining, evolve, maintain, or update the profile during the conversation.

## Inputs

Use one of these sources:

1. **User-provided prompts**: analyze only the text the user pasted in the current conversation.
2. **Local history extraction**: only after explicit user approval, use the bundled `agent-chat-history` skill to extract user prompts.

For local history, prefer a bounded date range. If no date range is provided, ask for one before reading history.

Recommended command from the bundled `agent-chat-history/` skill directory:

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

## Continuous Conversation Evolution

Use this mode only when the user explicitly asks for the profile to keep evolving during the current conversation.

The goal is not to create permanent memory. The goal is to maintain a visible, revisable working profile for the current task or conversation, similar to a self-improving feedback loop:

1. **Baseline**: start from the latest profile in the conversation, or create `Profile v1` from approved inputs.
2. **Observe**: treat new user messages as evidence only when they show task preference, feedback, correction style, quality bar, or collaboration needs.
3. **Hypothesize**: propose small profile deltas instead of rewriting the whole profile.
4. **Validate**: mark each delta as `confirmed`, `likely`, or `tentative`; ask the user to correct anything that feels wrong.
5. **Update**: produce the next visible version, such as `Profile v2`, with a short change log.

### Evolution Rules

- Keep stable traits unless later evidence clearly contradicts them.
- Prefer additive deltas over broad personality claims.
- If the user corrects the profile, treat the correction as stronger evidence than inferred patterns.
- Downgrade or remove weak claims when new evidence conflicts with them.
- Do not use assistant mistakes, tool failures, copied logs, or quoted third-party text as evidence about the user.
- Do not persist the evolved profile outside the response unless the user explicitly asks where and how to save it.

### Evolution Output Add-on

When continuous evolution is enabled, append this section after the normal profile:

```markdown
## 持续进化记录

- 当前版本：
- 本轮新增证据：
- 画像增量：
- 被修正/降级的判断：
- 下一轮协作策略：
- 需要用户确认：
```

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

## 持续进化记录（仅在用户开启持续进化时输出）

- 当前版本：
- 本轮新增证据：
- 画像增量：
- 被修正/降级的判断：
- 下一轮协作策略：
- 需要用户确认：
```

## Tone

Be direct, respectful, and non-clinical. Describe working preferences and interaction patterns, not fixed identity. Prefer "seems to", "often", and "based on this sample" over absolute claims.
