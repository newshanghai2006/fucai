import { defineStore } from 'pinia'
import { ref } from 'vue'
import { numbersApi } from '../api'

export const useNumbersStore = defineStore('numbers', () => {
  const groups = ref([
    { red: '', blue: '' },
    { red: '', blue: '' },
    { red: '', blue: '' },
    { red: '', blue: '' },
    { red: '', blue: '' },
  ])
  const savedNumbers = ref([])

  function parseNumbers(input) {
    if (!input) return []
    return input
      .split(/[\s,，]+/)
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n))
  }

  function validateGroup(group) {
    const errors = []
    const reds = parseNumbers(group.red)

    if (reds.length !== 6) {
      errors.push('请输入6个红球号码')
    } else {
      const invalid = reds.filter(n => n < 1 || n > 33)
      if (invalid.length > 0) errors.push('红球必须在1-33之间')

      const unique = new Set(reds)
      if (unique.size !== reds.length) errors.push('红球号码不能重复')
    }

    const blue = parseInt(group.blue)
    if (!group.blue || isNaN(blue)) {
      errors.push('请输入蓝球号码')
    } else if (blue < 1 || blue > 16) {
      errors.push('蓝球必须在1-16之间')
    }

    return errors
  }

  function validateAll() {
    const allErrors = []
    let validCount = 0
    for (let i = 0; i < groups.value.length; i++) {
      if (groups.value[i].red.trim() || groups.value[i].blue.trim()) {
        const errors = validateGroup(groups.value[i])
        if (errors.length > 0) {
          allErrors.push({ index: i, errors })
        } else {
          validCount++
        }
      }
    }
    return { errors: allErrors, validCount }
  }

  function getValidNumbers() {
    const result = []
    for (const group of groups.value) {
      if (group.red.trim() && group.blue.trim()) {
        const reds = parseNumbers(group.red)
        const blue = parseInt(group.blue)
        if (reds.length === 6 && !isNaN(blue)) {
          result.push({ red: reds, blue })
        }
      }
    }
    return result
  }

  function isFormValid() {
    const { errors, validCount } = validateAll()
    return validCount > 0 && errors.length === 0
  }

  async function loadSaved() {
    try {
      const { data } = await numbersApi.getSaved()
      savedNumbers.value = data.numbers
    } catch {
      savedNumbers.value = []
    }
  }

  async function saveNumbers() {
    const valid = getValidNumbers()
    if (valid.length === 0) return
    await numbersApi.save(valid)
    await loadSaved()
  }

  async function deleteSaved(id) {
    await numbersApi.deleteNumber(id)
    await loadSaved()
  }

  return {
    groups,
    savedNumbers,
    validateAll,
    getValidNumbers,
    isFormValid,
    loadSaved,
    saveNumbers,
    deleteSaved,
  }
})
