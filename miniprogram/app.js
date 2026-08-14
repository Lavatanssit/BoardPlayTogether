const config = require('./config')

App({
  globalData: {
    statusBarHeight: 20
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: config.cloudEnv,
        traceUser: true
      })
    }

    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      this.globalData.statusBarHeight = info.statusBarHeight || 20
    } catch (e) {
      // 忽略
    }
  }
})
