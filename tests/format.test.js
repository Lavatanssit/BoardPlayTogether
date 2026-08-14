const { formatDate } = require('../miniprogram/utils/format')

describe('formatDate', () => {
  test('时间戳格式化为中文日期时间', () => {
    const ts = new Date(2025, 2, 15, 19, 0).getTime() // 本地时间 2025-03-15 19:00
    expect(formatDate(ts)).toBe('3月15日 19:00')
  })

  test('个位数补零', () => {
    const ts = new Date(2025, 0, 5, 9, 5).getTime() // 2025-01-05 09:05
    expect(formatDate(ts)).toBe('1月5日 09:05')
  })

  test('空值返回空字符串', () => {
    expect(formatDate(0)).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})
