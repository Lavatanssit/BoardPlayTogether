const api = require('../../utils/api')

Page({
  data: { games: [], loading: false },

  onShow() {
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  async load() {
    this.setData({ loading: true })
    try {
      const games = await api.listMyGames()
      this.setData({ games, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/game/edit' })
  },

  goEdit(e) {
    wx.navigateTo({ url: `/pages/game/edit?id=${e.currentTarget.dataset.id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除',
      content: '确定删除这个桌游吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.deleteGame(id)
          wx.showToast({ title: '已删除', icon: 'success' })
          this.load()
        } catch (err) {
          wx.showToast({ title: err.message, icon: 'none' })
        }
      }
    })
  }
})
