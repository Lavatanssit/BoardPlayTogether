# 桌游聚会 · BoardPlayTogether

朋友间发起线下桌游局的小程序：各自录入拥有的桌游，发起聚会后按参与者持有的桌游投票，决定本次带哪些；附带骰子、抽签、猜先手等工具。**无支付，个人主体即可发布。**

## 功能

- **桌游库**：录入 / 编辑 / 删除你拥有的桌游（封面、人数、时长、类别、备注）
- **聚会**：发起（标题 / 时间 / 地点 / 备注）、转发邀请给朋友、加入 / 退出
- **投票**：聚会详情里点选想玩的桌游，实时看票数；发起人一键「按票数确定携带」（Top-N，N = 参与人数）
- **统计**：我的桌游数、发起 / 参与聚会数、最常出现的桌游、最活跃玩家
- **工具**：投骰子、桌游抽签、猜先手

## 技术栈

原生小程序（WXML / WXSS / JS）+ 微信云开发（云函数 + 云数据库 + 云存储），**无构建步骤**。所有后端能力走单个云函数 `api`（按 `action` 路由）。

## 目录结构

```
boardgame-party/
├── miniprogram/            # 小程序代码
│   ├── app.js / app.json / app.wxss
│   ├── config.js           # 配置入口（真实值放 config.local.js，每机私有）
│   ├── pages/              # 页面（聚会/桌游库/工具/我的 + 详情/创建/编辑等）
│   └── utils/              # api 封装、格式化、party 装饰
├── cloudfunctions/api/     # 唯一云函数（action 路由）
├── scripts/                # setup（新机初始化）/ sync（收尾同步）/ preview / upload
├── tests/                  # Jest 单测（纯函数）
├── docs/ai-memory.md       # AI 工作记忆
├── ai/sessions/            # AI 会话日志
├── AGENTS.md               # AI 协作指南（任何 AI 先读它）
├── .github/workflows/ci.yml
└── package.json            # lint / test / setup / sync / preview / upload 脚本
```

## 标准工作流（换机器 / 换 AI）

```bash
# 新机器：clone 后一条命令初始化
git clone https://github.com/Lavatanssit/BoardPlayTogether.git
cd BoardPlayTogether
npm run setup -- --name Lavatanssit --email 47296607+Lavatanssit@users.noreply.github.com

# 干活：Pro 设计 / Flash 实现 …

# 收尾：一条命令「会话日志 + 提交 + 推送」
npm run sync -- pro "本次做了什么" --push
```

`npm run setup` 会自动：装依赖、探测本机 Clash 端口配 git 代理、设置本仓库提交身份、从示例生成本地私有配置（`config.local.js`、`ci.private.config.js`）。

## 快速开始（一次性配置）

1. **注册小程序**：`mp.weixin.qq.com` → 注册 → 小程序 → 选「个人」主体（免费，无需营业执照），拿到 **AppID**。
2. **安装微信开发者工具**：`developers.weixin.qq.com` 下载稳定版。
3. **导入项目**：开发者工具 → 导入项目 → 选择本目录，AppID 填你的（或把 `project.config.json` 的 `appid` 改成你的）。
4. **开通云开发**：工具栏「云开发」→ 开通 → 创建环境 → 复制**环境 ID** → 填入 `miniprogram/config.local.js` 的 `cloudEnv`（`npm run setup` 会生成该文件）。
5. **创建数据库集合**：云开发控制台 → 数据库 → 创建集合：`users`、`games`、`parties`（权限用默认即可，数据读写都走云函数，云函数具备管理端权限）。
6. **部署云函数**：在开发者工具文件树里右键 `cloudfunctions/api` → 上传并部署（云端安装依赖）。
7. **编译运行**：点「编译」，用「预览」扫码真机测试。

## 开发命令

```bash
npm install                    # 首次安装工具链
npm run lint                   # ESLint 检查
npm run lint:fix               # 自动修复
npm test                       # Jest 单测
npm run check                  # lint + test（CI 也跑这条）
npm run preview                # 生成真机预览二维码
npm run upload -- 1.0.0 说明   # 用 miniprogram-ci 上传代码
npm run setup -- --name 你 --email 你   # 新机器一键初始化
npm run sync -- pro "目标" --push     # 收尾：日志 + 提交 + 推送
```

> `preview` / `upload` 需要：把 `ci.private.config.example.js` 复制为 `ci.private.config.js`（`npm run setup` 会自动生成），填入 AppID 与「上传密钥」路径（小程序后台 → 开发设置 → 小程序代码上传 → 下载上传密钥）。该配置文件已被 `.gitignore` 忽略，不会提交。

## 多机 + 多 AI 协作

1. **多机开发**：每台电脑 `git clone` → `npm run setup -- --name 你的名字 --email 你的邮箱` → 微信开发者工具导入即可（`config.local.js`、`ci.private.config.js` 是本地私有配置，各自填写，不随 git 同步）。
2. **AI 协作入口**：任何 AI 会话先读 `AGENTS.md` 和 `docs/ai-memory.md`。
3. **模型分工**：高层设计（架构 / 数据模型 / 工程化 / 评审 / 集成）用 **DS Pro**；局部功能实现（遵循既有模式的页面 / 函数）用 **DS Flash** 子代理。
4. **记忆同步**：每完成一个工作块，更新 `docs/ai-memory.md`，然后 `npm run sync -- pro "目标" --push` 一条命令完成「会话日志 + 提交 + 推送」——换个 AI、换台电脑都能无缝接着干。

## 版本迭代与发布

1. 改完代码 → `npm run check` 通过 → `npm run sync -- pro "目标" --push`。
2. 开发者工具「预览」真机自测（或 `npm run preview`）。
3. 「上传」代码 → 小程序后台设「体验版」，把朋友加为体验成员试玩。
4. 稳定后「提交审核」→ 通过后「发布」正式版。
5. CI 自动化：`.github/workflows/ci.yml` 在 push 时自动跑 `npm run check`；`npm run upload` 可接入发布流水线。

## 数据模型

| 集合 | 关键字段 |
|---|---|
| `users` | 文档 `_id` = openid；`nickname`、`avatarUrl`、`createdAt`、`updatedAt` |
| `games` | `_openid`、`name`、`category`、`minPlayers`、`maxPlayers`、`duration`、`imageFileID`、`notes`、`createdAt`、`updatedAt` |
| `parties` | `_openid`、`creatorOpenid`、`title`、`location`、`time`、`note`、`status(open\|finished\|cancelled)`、`participants[]`、`votes[]`、`result[]`、`createdAt`、`updatedAt` |

## 常见问题

- **调用云函数报错 / env 未配置**：确认 `miniprogram/config.local.js` 的 `cloudEnv` 已填真实环境 ID。
- **未知操作 / 集合不存在**：确认云函数已「上传并部署」，且集合 `users`、`games`、`parties` 已创建。
- **git 无法访问 github.com**：git 不走系统代理，国内网络用 `npm run setup` 自动配，或手动 `git config http.proxy http://127.0.0.1:端口`。
- **个人主体限制**：不能做社交 / 社区 / 直播 / 游戏等类目；本小程序选「工具」类目即可，且无支付需求，个人主体完全够用。
