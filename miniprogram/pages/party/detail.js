const api = require('../../utils/api')
const { decorate } = require('../../utils/party')

Page({
  data: {
    id: '',
    party: null,
    gameOptions: [],
    tally: {},
    myGameNames: [],
    selected: {},
    loading: false
  },

  onLoad(options) {
    this.setData({ id: options.id })
  },

  onShow() {
    this.load()
  },

  onShareAppMessage() {
    const party = this.data.party
    return {
      title: party ? `一起来玩：${party.title}` : '桌游聚会',
      path: `/pages/party/detail?id=${this.data.id}`
    }
  },

  async load() {
    this.setData({ loading: true })
    try {
      const raw = await api.getParty(this.data.id)
      const party = decorate(raw)
      const selected = {}
      ;(party.myGameNames || []).forEach((n) => { selected[n] = true })
      const gameOptions = (party.gameOptions || []).map((g) => ({
        ...g,
        ownersNicknames: (g.owners || []).map((o) => o.nickname).join('、')
      }))
      this.setData({
        party,
        gameOptions,
        tally: party.tally || {},
        myGameNames: party.myGameNames || [],
        selected,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  async join() {
    try {
      await api.joinParty(this.data.id)
      wx.showToast({ title: '已加入', icon: 'success' })
      this.load()
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  leave() {
    wx.showModal({
      title: '退出聚会',
      content: '确定退出吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.leaveParty(this.data.id)
          this.load()
        } catch (e) {
          wx.showToast({ title: e.message, icon: 'none' })
        }
      }
    })
  },

  toggleGame(e) {
    const name = e.currentTarget.dataset.name
    const selected = { ...this.data.selected }
    if (selected[name]) delete selected[name]
    else selected[name] = true
    this.setData({ selected })
  },

  async submitVote() {
    const gameNames = Object.keys(this.data.selected)
    try {
      await api.vote(this.data.id, gameNames)
      wx.showToast({ title: '投票已提交', icon: 'success' })
      this.load()
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  async confirmResult() {
    const party = this.data.party
    const options = this.data.gameOptions
      .map((g) => ({ name: g.name, count: this.data.tally[g.name] || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'))
    const n = Math.max(1, Math.min(options.length, party.participants.length))
    const result = options.slice(0, n).map((o) => o.name)
    if (!result.length) {
      wx.showToast({ title: '还没有可选的桌游', icon: 'none' })
      return
    }
    try {
      await api.setResult(this.data.id, result)
      wx.showToast({ title: '已确定携带', icon: 'success' })
      this.load()
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  finish() {
    wx.showModal({
      title: '结束聚会',
      content: '确定结束这次聚会吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.finishParty(this.data.id)
          this.load()
        } catch (e) {
          wx.showToast({ title: e.message, icon: 'none' })
        }
      }
    })
  },

  cancel() {
    wx.showModal({
      title: '取消聚会',
      content: '确定取消这次聚会吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.cancelParty(this.data.id)
          this.load()
        } catch (e) {
          wx.showToast({ title: e.message, icon: 'none' })
        }
      }
    })
  }
})
