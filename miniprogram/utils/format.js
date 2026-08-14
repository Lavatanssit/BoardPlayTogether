function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

// 时间戳（毫秒）→ "3月15日 19:00"
function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

module.exports = { formatDate }
