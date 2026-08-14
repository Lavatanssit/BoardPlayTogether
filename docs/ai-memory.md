# AI 工作记忆

> 跨会话的“活记忆”。每次完成一个工作块都要更新本文件，并随代码一起提交。

## 当前状态

- 阶段：v0 骨架完成（原生小程序 + 云开发，含桌游库 / 聚会投票 / 统计 / 骰子·抽签·猜先手）。
- 代码已就绪，**尚未在微信开发者工具中运行**。
- 已推送 GitHub（`main` 分支；历史已重写为统一身份 `Lavatanssit <47296607+Lavatanssit@users.noreply.github.com>`）。
- 本机 git 已配仓库级代理 `http://127.0.0.1:7877`（Clash），push/pull 需开着 Clash。

## 待办（下一步）

- [ ] 替换 `miniprogram/config.js` 的 `cloudEnv` 为真实云开发环境 ID
- [ ] 微信开发者工具：开通云开发 → 创建集合 `users`、`games`、`parties` → 右键 `cloudfunctions/api` 上传并部署（云端安装依赖）
- [ ] 真机联调：聚会创建 / 加入 / 投票 / 确定携带、统计
- [ ] 用 `npm run check` 跑 lint + 单测
- [ ] 新机器接手：`git clone` → `npm install` → 填 `miniprogram/config.js` 与 `ci.private.config.js` → 部署云函数
- [ ] 体验版给朋友试 → 提交审核 → 发布

## 关键决策

- 后端统一走单个云函数 `api`（action 路由），降低部署成本。
- 桌游封面 / 头像用云存储 fileID 直接展示。
- 聚会「确定携带」由发起人按票数生成 Top-N（N = 参与者人数）。
- 模型分工：Pro = 设计 / 评审 / 集成；Flash = 局部实现（见 AGENTS.md）。

## 踩坑记录

- 云函数用服务端 SDK，不受集合权限限制，但集合仍需在控制台手动创建。
- 个人主体可选类目有限，不能做社交 / 社区 / 直播 / 游戏等；本工具选「工具」类目。
- 头像昵称用 `chooseAvatar` + `<input type="nickname">`（旧 `getUserProfile` 已返回通用信息）。
- 本机有全局 commit-msg 钩子（`C:\Users\Administrator\.gitlocalhooks`）：提交首行必须含 `#数字`（如 `#1`），且首行 ≤ 90 字符。
- git 默认不走系统代理；国内网络需给仓库配 `http.proxy`（本机 Clash 端口 `7877`），换机器各自配置。
- 本仓库提交身份为 `Lavatanssit / 47296607+Lavatanssit@users.noreply.github.com`（仅本目录）。
