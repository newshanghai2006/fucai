import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lotteryApi } from '../api'

export const useResultStore = defineStore('result', () => {
  const periods = ref([])
  const selectedPeriod = ref(null)
  const compareResults = ref([])
  const isLoading = ref(false)
  const error = ref('')
  const drawInfo = ref(null)

  const summary = computed(() => {
    let totalWinCount = 0
    let totalPrize = 0

    for (const result of compareResults.value) {
      if (result.won) {
        totalWinCount++
        totalPrize += result.prize
      }
    }

    return { totalWinCount, totalPrize }
  })

  async function fetchPeriods() {
    const { data } = await lotteryApi.getRecent(20)
    periods.value = data.periods
    if (data.periods.length > 0 && !selectedPeriod.value) {
      selectedPeriod.value = data.periods[0]
    }
    return data.periods
  }

  async function submitCompare(numbers, drawNumbers) {
    isLoading.value = true
    error.value = ''
    compareResults.value = []

    try {
      const { red: drawRed, blue: drawBlue } = drawNumbers
      if (!drawRed || drawRed.length !== 6 || !drawBlue) {
        error.value = '开奖号码不完整'
        return
      }

      drawInfo.value = { red: drawRed, blue: drawBlue }

      compareResults.value = numbers.map(numberGroup => {
        const redMatch = numberGroup.red.filter(n => drawRed.includes(n)).length
        const blueMatch = numberGroup.blue === drawBlue ? 1 : 0
        const prize = getPrize(redMatch, blueMatch)

        return {
          red: numberGroup.red,
          blue: numberGroup.blue,
          redMatch,
          blueMatch,
          ...prize,
        }
      })
    } catch (err) {
      error.value = '核对失败，请稍后重试'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function getPrize(redMatch, blueMatch) {
    const rules = [
      { level: 1, name: '一等奖', r: 6, b: 1, prize: 5000000, note: '浮动' },
      { level: 2, name: '二等奖', r: 6, b: 0, prize: 200000, note: '浮动' },
      { level: 3, name: '三等奖', r: 5, b: 1, prize: 3000, note: '' },
      { level: 4, name: '四等奖', r: 5, b: 0, prize: 200, note: '' },
      { level: 4, name: '四等奖', r: 4, b: 1, prize: 200, note: '' },
      { level: 5, name: '五等奖', r: 4, b: 0, prize: 10, note: '' },
      { level: 5, name: '五等奖', r: 3, b: 1, prize: 10, note: '' },
      { level: 6, name: '六等奖', r: 2, b: 1, prize: 5, note: '' },
      { level: 6, name: '六等奖', r: 1, b: 1, prize: 5, note: '' },
      { level: 6, name: '六等奖', r: 0, b: 1, prize: 5, note: '' },
      { level: 7, name: '福运奖', r: 3, b: 0, prize: 5, note: '' },
    ]

    for (const rule of rules) {
      if (rule.r === redMatch && rule.b === blueMatch) {
        return { won: true, level: rule.level, name: rule.name, prize: rule.prize, note: rule.note }
      }
    }

    return { won: false, level: 0, name: '未中奖', prize: 0, note: '' }
  }

  function reset() {
    compareResults.value = []
    error.value = ''
    drawInfo.value = null
  }

  return {
    periods,
    selectedPeriod,
    compareResults,
    isLoading,
    error,
    summary,
    drawInfo,
    fetchPeriods,
    submitCompare,
    reset,
  }
})
