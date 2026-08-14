const api = require('../../utils/api')

Page({
  data: {
    id: '',
    name: '',
    category: '',
    minPlayers: '',
    maxPlayers: '',
    duration: '',
    notes: '',
    imageFileID: ''
  },

  onLoad(options) {
    wx.setNavigationBarTitle({ title: options.id ? '编辑桌游' : '添加桌游' })
    if (options.id) {
      this.setData({ id: options.id })
      this.loadGame(options.id)
    }
  },

  async loadGame(id) {
    try {
      const games = await api.listMyGames()
      const g = games.find((x) => x._id === id)
      if (g) {
        this.setData({
          name: g.name,
          category: g.category || '',
          duration: g.duration || '',
          minPlayers: g.minPlayers ? String(g.minPlayers) : '',
          maxPlayers: g.maxPlayers ? String(g.maxPlayers) : '',
          notes: g.notes || '',
          imageFileID: g.imageFileID || ''
        })
      }
    } catch (e) {
      // 忽略
    }
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async chooseImage() {
    const res = await new Promise((resolve) => {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        success: resolve,
        fail: () => resolve(null)
      })
    })
    if (!res || !res.tempFiles || !res.tempFiles.length) return

    wx.showLoading({ title: '上传中' })
    try {
      const file = res.tempFiles[0]
      const ext = (file.tempFilePath.match(/\.(\w+)$/) || [null, 'png'])[1]
      const cloudPath = `games/${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`
      const up = await wx.cloud.uploadFile({ cloudPath, filePath: file.tempFilePath })
      this.setData({ imageFileID: up.fileID })
    } catch (e) {
      wx.showToast({ title: '上传失败', icon: 'none' })
    }
    wx.hideLoading()
  },

  async submit() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '请填写桌游名称', icon: 'none' })
      return
    }
    const payload = {
      name,
      category: this.data.category.trim(),
      minPlayers: parseInt(this.data.minPlayers, 10) || 0,
      maxPlayers: parseInt(this.data.maxPlayers, 10) || 0,
      duration: this.data.duration.trim(),
      notes: this.data.notes.trim(),
      imageFileID: this.data.imageFileID
    }

    wx.showLoading({ title: '保存中' })
    try {
      if (this.data.id) {
        await api.updateGame({ id: this.data.id, ...payload })
      } else {
        await api.addGame(payload)
      }
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message, icon: 'none' })
    }
  }
})
