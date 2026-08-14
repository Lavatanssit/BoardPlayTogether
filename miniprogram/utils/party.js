const { formatDate } = require('./format')

const STATUS_TEXT = { open: '进行中', finished: '已结束', cancelled: '已取消' }

// 给聚会补充展示字段：状态文案、时间文案
function decorate(party) {
  if (!party) return party
  return {
    ...party,
    statusText: STATUS_TEXT[party.status] || party.status,
    timeText: formatDate(party.time)
  }
}

module.exports = { decorate, STATUS_TEXT }
