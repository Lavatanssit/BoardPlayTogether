// 统一的云函数调用封装：所有后端能力都通过云函数 api 完成
function call(action, payload = {}) {
  return wx.cloud
    .callFunction({ name: 'api', data: { action, payload } })
    .then((res) => {
      const r = res.result
      if (r && r.code === 0) return r.data
      const msg = (r && r.msg) || '请求失败'
      return Promise.reject(new Error(msg))
    })
    .catch((err) => {
      const msg = (err && err.errMsg) || (err && err.message) || '请求失败，请检查云开发配置'
      return Promise.reject(new Error(msg))
    })
}

module.exports = {
  // 用户
  getProfile: () => call('getProfile'),
  saveProfile: (p) => call('saveProfile', p),

  // 桌游
  listMyGames: () => call('listMyGames'),
  addGame: (p) => call('addGame', p),
  updateGame: (p) => call('updateGame', p),
  deleteGame: (id) => call('deleteGame', { id }),

  // 聚会
  createParty: (p) => call('createParty', p),
  listParties: () => call('listParties'),
  getParty: (id) => call('getParty', { id }),
  joinParty: (id) => call('joinParty', { id }),
  leaveParty: (id) => call('leaveParty', { id }),
  vote: (id, gameNames) => call('vote', { id, gameNames }),
  setResult: (id, result) => call('setResult', { id, result }),
  cancelParty: (id) => call('cancelParty', { id }),
  finishParty: (id) => call('finishParty', { id }),

  // 统计
  getStats: () => call('getStats')
}
