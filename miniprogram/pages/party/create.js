const api = require('../../utils/api')

Page({
  data: { title: '', location: '', date: '', time: '', note: '' },

  onTitle(e) { this.setData({ title: e.detail.value }) },
  onLocation(e) { this.setData({ location: e.detail.value }) },
  onNote(e) { this.setData({ note: e.detail.value }) },
  onDate(e) { this.setData({ date: e.detail.value }) },
  onTime(e) { this.setData({ time: e.detail.value }) },

  async submit() {
    const { title, location, date, time, note } = this.data
    if (!title.trim()) {
      wx.showToast({ title: '请填写标题', icon: 'none' })
      return
    }
    if (!date || !time) {
      wx.showToast({ title: '请选择时间', icon: 'none' })
      return
    }
    const ts = new Date(`${date.replace(/-/g, '/')} ${time}:00`).getTime()

    wx.showLoading({ title: '创建中' })
    try {
      const party = await api.createParty({
        title: title.trim(),
        location: location.trim(),
        time: ts,
        note: note.trim()
      })
      wx.hideLoading()
      wx.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => wx.redirectTo({ url: `/pages/party/detail?id=${party._id}` }), 600)
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message, icon: 'none' })
    }
  }
})
