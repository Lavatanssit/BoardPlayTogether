// 使用 miniprogram-ci 生成真机预览二维码（需要 ci.private.config.js + 上传密钥）
const path = require('path')
const fs = require('fs')

const root = path.resolve(__dirname, '..')
const cfgPath = path.join(root, 'ci.private.config.js')

if (!fs.existsSync(cfgPath)) {
  console.log('未找到 ci.private.config.js，跳过预览。')
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
const project = new ci.Project({
  appid: cfg.appid,
  type: 'miniProgram',
  projectPath: root,
  privateKeyPath: path.resolve(root, cfg.privateKeyPath),
  ignores: ['node_modules/**/*', 'cloudfunctions/**/node_modules/**/*', '.git/**/*']
})

;(async () => {
  const dest = path.join(root, 'preview.jpg')
  await ci.preview({
    project,
    desc: '本地预览',
    setting: { es6: true, minify: true },
    qrcodeFormat: 'image',
    qrcodeOutputDest: dest,
    onProgressUpdate: () => {}
  })
  console.log('预览二维码已生成：', dest)
})().catch((e) => {
  console.error('预览失败：', e.message || e)
  process.exit(1)
})
