Page({
  data: {
    counts: [1, 2, 3, 4, 5, 6],
    count: 2,
    dice: [1, 1],
    total: 2,
    rolling: false
  },

  onCount(e) {
    const count = Number(e.currentTarget.dataset.count)
    const dice = this.randomDice(count)
    this.setData({ count, dice, total: this.sum(dice) })
  },

  roll() {
    if (this.data.rolling) return
    this.setData({ rolling: true })
    let times = 0
    this.timer = setInterval(() => {
      times++
      const dice = this.randomDice(this.data.count)
      this.setData({ dice, total: this.sum(dice) })
      if (times >= 12) {
        clearInterval(this.timer)
        this.timer = null
        this.setData({ rolling: false })
      }
    }, 60)
  },

  randomDice(count) {
    const dice = []
    for (let i = 0; i < count; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1)
    }
    return dice
  },

  sum(dice) {
    return dice.reduce((s, n) => s + n, 0)
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  }
})
