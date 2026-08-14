Page({
  data: {
    names: '',
    list: [],
    shuffled: false
  },

  onNames(e) {
    this.setData({ names: e.detail.value })
  },

  shuffle() {
    const list = this.data.names.split('\n').map((s) => s.trim()).filter(Boolean)
    if (list.length < 2) {
      wx.showToast({ title: '请至少输入 2 个名字', icon: 'none' })
      return
    }
    // Fisher-Yates 洗牌
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = list[i]
      list[i] = list[j]
      list[j] = tmp
    }
    this.setData({ list, shuffled: true })
  }
})
