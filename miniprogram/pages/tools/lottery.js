const api = require('../../utils/api')

Page({
  data: {
    tab: 'game', // 'game' | 'people'
    games: [],
    names: '',
    rolling: false,
    result: ''
  },

  onShow() {
    this.loadGames()
  },

  async loadGames() {
    try {
      const games = await api.listMyGames()
      this.setData({ games })
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  onTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab, result: '' })
  },

  onNames(e) {
    this.setData({ names: e.detail.value })
  },

  getPool() {
    if (this.data.tab === 'game') {
      return this.data.games.map((g) => g.name).filter(Boolean)
    }
    return this.data.names.split('\n').map((s) => s.trim()).filter(Boolean)
  },

  draw() {
    if (this.data.rolling) return
    const pool = this.getPool()
    if (!pool.length) {
      const tip = this.data.tab === 'game' ? '桌游库还是空的，先去添加吧' : '请先输入名字（每行一个）'
      wx.showToast({ title: tip, icon: 'none' })
      return
    }
    this.setData({ rolling: true })
    let times = 0
    this.timer = setInterval(() => {
      times++
      const idx = Math.floor(Math.random() * pool.length)
      this.setData({ result: pool[idx] })
      if (times >= 15) {
        clearInterval(this.timer)
        this.timer = null
        this.setData({ rolling: false })
      }
    }, 70)
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  }
})
