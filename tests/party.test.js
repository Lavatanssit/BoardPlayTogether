const { decorate, STATUS_TEXT } = require('../miniprogram/utils/party')

describe('decorate', () => {
  test('补充状态文案和时间文案', () => {
    const ts = new Date(2025, 0, 5, 9, 5).getTime()
    const p = decorate({ status: 'open', time: ts, title: 'x' })
    expect(p.statusText).toBe('进行中')
    expect(p.timeText).toBe('1月5日 09:05')
  })

  test('已结束/已取消状态映射正确', () => {
    expect(decorate({ status: 'finished', time: 0 }).statusText).toBe('已结束')
    expect(decorate({ status: 'cancelled', time: 0 }).statusText).toBe('已取消')
  })

  test('未知状态原样保留', () => {
    expect(decorate({ status: 'weird', time: 0 }).statusText).toBe('weird')
  })

  test('STATUS_TEXT 导出完整', () => {
    expect(Object.keys(STATUS_TEXT).sort()).toEqual(['cancelled', 'finished', 'open'])
  })
})
