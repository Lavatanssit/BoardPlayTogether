// 使用 miniprogram-ci 上传代码（需要 ci.private.config.js + 上传密钥）
// 用法：npm run upload -- 1.0.0 本次更新说明
const path = require('path')
const fs = require('fs')

const root = path.resolve(__dirname, '..')
const cfgPath = path.join(root, 'ci.private.config.js')

if (!fs.existsSync(cfgPath)) {
  console.log('未找到 ci.private.config.js，跳过上传。')
  console.log('请复制 ci.private.config.example.js 为 ci.private.config.js 并填写 appid 与 privateKeyPath（上传密钥）。')
  process.exit(0)
}

let ci
try {
  ci = require('miniprogram-ci')
} catch (e) {
  console.log('未安装 miniprogram-ci，请先运行：npm install')
  process.exit(0)
}

const cfg = require(cfgPath)
const version = process.argv[2] || '1.0.0'
const desc = process.argv.slice(3).join(' ') || '例行更新'

const project = new ci.Project({
  appid: cfg.appid,
  type: 'miniProgram',
  projectPath: root,
  privateKeyPath: path.resolve(root, cfg.privateKeyPath),
  ignores: ['node_modules/**/*', 'cloudfunctions/**/node_modules/**/*', '.git/**/*']
})

;(async () => {
  await ci.upload({
    project,
    version,
    desc,
    setting: { es6: true, minify: true },
    onProgressUpdate: () => {}
  })
  console.log(`上传成功：版本 ${version}（${desc}）`)
})().catch((e) => {
  console.error('上传失败：', e.message || e)
  process.exit(1)
})
