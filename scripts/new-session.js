// 新建一次 AI 会话日志，用于多机/多 AI 协作
// 用法：npm run new:session -- pro 本次目标描述
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'ai', 'sessions')
fs.mkdirSync(dir, { recursive: true })

const now = new Date()
const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-')
const model = process.argv[2] || 'pro'
const objective = process.argv.slice(3).join(' ') || '（填写本次会话目标）'

const content = `# 会话日志 ${stamp}

- 模型：${model}（pro = 高层设计 / flash = 局部实现）
- 目标：${objective}

## 做了什么
-

## 触及文件
-

## 决策与备注
-

## 下一步
-
`

const file = path.join(dir, `${stamp}.md`)
fs.writeFileSync(file, content, 'utf8')
console.log('已创建会话日志：', path.relative(root, file))
console.log('提示：开始前先读 AGENTS.md 和 docs/ai-memory.md；结束后更新这两个文件并一起提交。')
