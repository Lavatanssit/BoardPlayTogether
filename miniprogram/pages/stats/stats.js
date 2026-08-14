const api = require('../../utils/api')

Page({
  data: {
    loading: false,
    stats: {
      myGameCount: 0,
      createdCount: 0,
      participatedCount: 0,
      totalParties: 0,
      topGames: [],
      topPlayers: []
    }
  },

  onLoad() {
    this.load()
  },

  async load() {
    this.setData({ loading: true })
    try {
      const stats = await api.getStats()
      this.setData({ stats, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: e.message, icon: 'none' })
    }
  }
})
