const api = require('../../utils/api')

Page({
  data: {
    nickname: '',
    avatarUrl: '',
    loading: false
  },

  onShow() {
    this.loadProfile()
  },

  async loadProfile() {
    this.setData({ loading: true })
    try {
      const profile = await api.getProfile()
      this.setData({
        nickname: profile.nickname || '',
        avatarUrl: profile.avatarUrl || '',
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: e.message, icon: 'none' })
    }
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onNicknameBlur() {
    // 昵称失焦时保存，带上当前 avatarUrl 避免覆盖头像
    this.saveProfile()
  },

  async onChooseAvatar(e) {
    const tempPath = e.detail.avatarUrl
    if (!tempPath) return

    wx.showLoading({ title: '上传中' })
    try {
      const ext = (tempPath.match(/\.(\w+)$/) || [null, 'png'])[1]
      const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`
      const up = await wx.cloud.uploadFile({ cloudPath, filePath: tempPath })
      const avatarUrl = up.fileID
      this.setData({ avatarUrl })
      // 保存时带上当前昵称，避免覆盖昵称
      await this.saveProfile()
      wx.hideLoading()
      wx.showToast({ title: '头像已更新', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '上传失败', icon: 'none' })
    }
  },

  async saveProfile() {
    try {
      await api.saveProfile({
        nickname: this.data.nickname.trim(),
        avatarUrl: this.data.avatarUrl
      })
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' })
    }
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  showHelp() {
    wx.showModal({
      title: '使用说明',
      content: '1. 在「桌游库」录入你拥有的桌游\n2. 在「聚会」发起聚会或加入朋友的聚会\n3. 参与者投票，选出想玩的桌游\n4. 发起人按票数确定本次携带的桌游\n5. 在「我的统计」查看个人数据',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
