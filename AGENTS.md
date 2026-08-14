# AGENTS.md —— 本项目 AI 协作指南

> 任何 AI 代理（含未来的会话）接手本项目时，请**先读本文件与 docs/ai-memory.md** 再动手。

## 项目概述

微信小程序「桌游聚会」：原生小程序 + 微信云开发。朋友间发起线下桌游局、按参与者持有的桌游投票决定携带哪些，附骰子 / 抽签 / 猜先手工具。无支付，个人主体即可发布。

## 技术栈与目录

- 原生小程序（WXML/WXSS/JS），无构建步骤；后端走微信云开发（云函数 + 云数据库 + 云存储）。
- `miniprogram/` 小程序代码（`pages/`、`utils/`、`app.*`、`config.js`）
- `cloudfunctions/api/` 唯一云函数，用 `action` 字段路由所有后端操作
- `scripts/` 工程脚本（`preview`/`upload` 用 miniprogram-ci；`new-session` 建会话日志）
- `tests/` Jest 单测（只测纯函数 `utils/`）
- `docs/ai-memory.md` 活的工作记忆；`ai/sessions/` 会话日志
- `.github/workflows/ci.yml` CI（push 时跑 lint + test）

## 数据模型（云数据库集合）

- `users`：文档 `_id` = openid；字段 `nickname, avatarUrl, createdAt, updatedAt`
- `games`：`{ _openid, name, category, minPlayers, maxPlayers, duration, imageFileID, notes, createdAt, updatedAt }`
- `parties`：`{ _openid, creatorOpenid, title, location, time, note, status(open|finished|cancelled), participants[{openid,nickname,avatarUrl,joinedAt}], votes[{openid,nickname,avatarUrl,gameNames[]}], result[name], createdAt, updatedAt }`

## 模型分工约定（重要）

- **DS Pro**：高层设计——架构、数据模型、API 契约、工程化配置、记忆规范、代码评审与集成、Git。
- **DS Flash**：局部功能实现——遵循既有模式的页面 / 函数机械实现。
- 派发局部实现用后台子代理（`subagent_fork` 继承上下文更稳）；设计、评审、合并留在 Pro。

## 常用命令

```bash
npm install                    # 首次
npm run lint                   # ESLint 检查
npm run lint:fix               # 自动修复
npm test                       # Jest 单测
npm run check                  # lint + test
npm run preview                # 生成预览二维码（需 ci.private.config.js）
npm run upload -- 1.0.0 说明   # 上传代码（需上传密钥）
npm run new:session -- pro 目标 # 新建会话日志
```

## 硬性约定

- 前端所有后端调用必须走 `miniprogram/utils/api.js` 封装（云函数 action 路由），**禁止页面里直接 `wx.cloud.callFunction`**。
- 页面展示字段补充用 `utils/party.js` 的 `decorate()`（statusText/timeText）与 `utils/format.js`。
- 每完成一个工作块：更新 `docs/ai-memory.md`、在 `ai/sessions/` 追加会话日志，并与代码一起提交。
