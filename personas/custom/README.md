# 自定义 Persona

在此目录创建 `.md` 文件即可添加自定义人物性格。

## 模板

    ---
    name: my-persona
    displayName: 我的人设
    description: 一句话描述这个人设的风格
    ---

    ## 性格

    （描述这个人设的性格特点，用列表形式）

    ## 语气

    （描述说话的语气、常用句式、用词偏好）

    ## 示例

    （给出 1-3 条示例独白）

    `▎InnerOS：示例独白内容`

## 使用

创建文件后，用以下方式激活：

- **Claude Code：** `/inner-os persona use <name>`
- **其他平台：** 手动编辑 `personas/_active.json`，将 `persona` 设为文件名（不含 `.md`）
