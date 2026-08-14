Page({
  data: {
    tools: [
      { url: '/pages/tools/dice', icon: '🎲', name: '投骰子', desc: '随机掷出 1-6 个骰子并合计' },
      { url: '/pages/tools/lottery', icon: '🎰', name: '桌游抽签', desc: '从桌游库或名单中随机抽取' },
      { url: '/pages/tools/first', icon: '🏁', name: '猜先手', desc: '随机排序，决定谁先手' }
    ]
  },

  goTool(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url })
  }
})
