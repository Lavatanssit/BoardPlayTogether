// ============ 云开发环境配置 ============
// 默认值可提交到 git；每台机器的私有值请放到同目录的 config.local.js（已被 .gitignore 忽略）。
// 快速生成：npm run setup（会从 config.local.example.js 复制一份）。
const defaults = {
  cloudEnv: 'your-cloud-env-id'
}

let local = {}
try {
  local = require('./config.local.js')
} catch (e) {
  // 未创建 config.local.js 时使用默认值
}

module.exports = { ...defaults, ...local }
