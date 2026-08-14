# 会话日志 2026-08-14

- 模型：pro（高层设计 + 集成；局部页面实现派发给 2 个 flash 子代理）
- 目标：搭建「桌游聚会」小程序完整骨架 + 工程化工具链 + 多 AI 协作记忆机制

## 做了什么

- 高层设计：数据模型（users / games / parties）、API 契约（单云函数 `api` action 路由）、页面结构、tabBar。
- Pro 实现：云函数 `api`（用户 / 桌游 / 聚会 / 投票 / 统计全部逻辑）、桌游库页、聚会列表 / 创建 / 详情（含投票与确定携带）。
- Flash 实现（2 个后台子代理，已评审通过）：工具页（入口 / 骰子 / 抽签 / 猜先手）、统计页、我的页。
- 工程化：ESLint、Jest 单测（format / party）、miniprogram-ci preview/upload 脚本、GitHub Actions CI。
- 记忆机制：`AGENTS.md`（AI 协作指南）、`docs/ai-memory.md`（活记忆）、`ai/sessions/`（会话日志）、`scripts/new-session.js`。
- 校验：17 个 JSON 文件 UTF-8 解析全部通过；逐页复核了 WXML/JS 绑定一致性。

## 触及文件

- 全部（首次搭建，见 git 提交）

## 决策与备注

- 后端统一走单个云函数，降低多机部署成本。
- 桌面封面 / 头像用云存储 fileID 直接展示。
- 聚会「确定携带」按票数自动取 Top-N（N = 参与人数）。
- 头像昵称用 `chooseAvatar` + `<input type="nickname">`（新能力，旧 `getUserProfile` 已返回通用信息）。
- 沙箱限制：本会话无法在本地跑 node（Access is denied）与 npm 网络安装，lint/test 需在用户机器或 CI 执行。

## 下一步

- 替换 `miniprogram/config.js` 的 `cloudEnv`；部署云函数；创建集合；真机联调。
