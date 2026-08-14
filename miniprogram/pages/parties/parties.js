const api = require('../../utils/api')
const { decorate } = require('../../utils/party')

Page({
  data: { parties: [], loading: false },

  onShow() {
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  async load() {
    this.setData({ loading: true })
    try {
      const raw = await api.listParties()
      this.setData({ parties: raw.map(decorate), loading: false })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/party/create' })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/party/detail?id=${e.currentTarget.dataset.id}` })
  }
})
