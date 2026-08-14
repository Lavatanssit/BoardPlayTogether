#!/usr/bin/env node
/**
 * 一键初始化开发机（新机器 clone 之后执行一次即可）：
 *
 *   npm run setup -- --name 你的名字 --email 你的邮箱
 *   npm run setup -- --name 你的名字 --email 你的邮箱 --proxy http://127.0.0.1:7890
 *   npm run setup -- --no-proxy
 *
 * 自动完成：安装依赖、配置本仓库 git 身份与代理、生成本地私有配置文件。
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const root = path.resolve(__dirname, '..')
const isWin = process.platform === 'win32'

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

function ask(question, def) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(def ? `${question} [${def}]: ` : `${question}: `, (ans) => {
      rl.close()
      resolve((ans || '').trim() || def || '')
    })
  })
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--name') args.name = argv[++i]
    else if (a === '--email') args.email = argv[++i]
    else if (a === '--proxy') args.proxy = argv[++i]
    else if (a === '--no-proxy') args.noProxy = true
  }
  return args
}

function gitGet(key) {
  return runSilent(`git config ${key}`)
}

// 从 Windows 系统代理读取端口（Clash/V2ray 等开启“系统代理”时会写入）
function detectWindowsProxy() {
  try {
    const out = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer',
      { encoding: 'utf8' }
    )
    const m = out.match(/ProxyServer\s+REG_SZ\s+(.+)/)
    if (m) {
      let v = m[1].trim()
      // 形如 "127.0.0.1:7877" 或 "http=127.0.0.1:7877;https=..."
      if (v.includes('=')) v = v.split(';').map((s) => s.split('=')[1]).find(Boolean) || ''
      v = v.replace(/^https?:\/\//, '')
      if (v) return `http://${v}`
    }
  } catch (e) {
    /* 忽略 */
  }
  return null
}

function ensureLocal(localRel, exampleRel) {
  const local = path.join(root, localRel)
  const example = path.join(root, exampleRel)
  if (fs.existsSync(local)) {
    console.log(`  · ${localRel} 已存在（跳过）`)
    return
  }
  fs.copyFileSync(example, local)
  console.log(`  · 已生成 ${localRel}（请编辑填入真实值）`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  console.log('== 桌游聚会 · 开发机初始化 ==\n')

  // 1) 依赖
  if (!fs.existsSync(path.join(root, 'node_modules'))) {
    console.log('[1/4] 安装依赖…')
    run('npm install')
  } else {
    console.log('[1/4] 依赖已存在，跳过')
  }

  // 2) 代理（仅本仓库）
  let proxy = args.proxy || null
  if (!args.noProxy && !proxy && isWin) proxy = detectWindowsProxy()
  const existingProxy = gitGet('http.proxy')
  if (args.noProxy) {
    console.log('[2/4] 已指定 --no-proxy，跳过代理配置')
  } else if (proxy && !existingProxy) {
    run(`git config http.proxy ${proxy}`)
    run(`git config https.proxy ${proxy}`)
    console.log(`[2/4] 已配置本仓库 git 代理：${proxy}`)
  } else if (existingProxy) {
    console.log(`[2/4] git 代理已存在：${existingProxy}`)
  } else {
    console.log('[2/4] 未检测到代理（直连环境；如需代理加 --proxy http://127.0.0.1:端口）')
  }

  // 3) 身份（仅本仓库）
  const name = args.name || gitGet('user.name') || (await ask('git user.name', ''))
  const email = args.email || gitGet('user.email') || (await ask('git user.email', ''))
  if (name && email) {
    run(`git config user.name "${name}"`)
    run(`git config user.email "${email}"`)
    console.log(`[3/4] 本仓库提交身份：${name} <${email}>`)
  } else {
    console.log('[3/4] 未设置身份（可稍后手动执行 git config user.name/email）')
  }

  // 4) 本地私有配置
  console.log('[4/4] 本地私有配置文件：')
  ensureLocal('miniprogram/config.local.js', 'miniprogram/config.local.example.js')
  ensureLocal('ci.private.config.js', 'ci.private.config.example.js')

  console.log('\n== 完成 ==')
  console.log('剩余微信侧手动步骤：')
  console.log('  1. 微信开发者工具导入本目录，AppID 填你的')
  console.log('  2. 开通云开发 → 填 miniprogram/config.local.js 的 cloudEnv')
  console.log('  3. 云开发控制台创建集合：users、games、parties')
  console.log('  4. 右键 cloudfunctions/api → 上传并部署（云端安装依赖）')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
