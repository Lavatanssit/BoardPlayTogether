#!/usr/bin/env node
/**
 * 工作块收尾：生成会话日志 + 提交 + 可选推送（多机 / 多 AI 同步）。
 *
 *   npm run sync -- pro "本次做了什么" --push
 *   npm run sync -- flash "实现了某某页面" --push --all
 *
 * 默认只提交 ai/ 与 docs/；加 --all 提交全部改动；加 --push 推送。
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit' })
}

function runSilent(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()
  } catch (e) {
    return ''
  }
}

function main() {
  const argv = process.argv.slice(2)
  const push = argv.includes('--push')
  const all = argv.includes('--all')
  const positional = argv.filter((a) => a !== '--push' && a !== '--all')

  let model = 'pro'
  const objectiveParts = []
  for (const a of positional) {
    if ((a === 'pro' || a === 'flash') && objectiveParts.length === 0) model = a
    else objectiveParts.push(a)
  }
  const objective = objectiveParts.join(' ') || '（填写本次会话目标）'

  // 1) 生成会话日志
  const dir = path.join(root, 'ai', 'sessions')
  fs.mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const file = path.join(dir, `${stamp}-${model}.md`)
  fs.writeFileSync(
    file,
    `# 会话日志 ${stamp}\n\n- 模型：${model}（pro = 高层设计 / flash = 局部实现）\n- 目标：${objective}\n\n## 做了什么\n-\n\n## 触及文件\n-\n\n## 决策与备注\n-\n\n## 下一步\n-\n`,
    'utf8'
  )
  console.log('已创建会话日志：', path.relative(root, file))

  // 2) 提交
  const scope = all ? '全部改动' : 'ai/ 与 docs/'
  console.log(`提交范围：${scope}`)
  if (all) run('git add -A')
  else run('git add ai docs')

  if (!runSilent('git diff --cached --name-only')) {
    console.log('没有需要提交的改动，跳过提交。')
    return
  }

  const issue = String(Date.now()).slice(-8)
  const msg = `chore: sync AI session log #${issue}`
  run(`git commit -m "${msg}"`)

  // 3) 推送
  if (push) {
    console.log('\n推送中…')
    run('git push origin main')
    console.log('已推送。')
  } else {
    console.log('\n未加 --push：已提交但未推送。需要时执行：git push origin main')
  }
}

main()
