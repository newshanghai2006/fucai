import { defineStore } from 'pinia'
import { ref } from 'vue'
import { numbersApi } from '../api'

export const useNumbersStore = defineStore('numbers', () => {
  const currentNumbers = ref([])
  const savedNumbers = ref([])

  function addNumber() {
    if (currentNumbers.value.length >= 10) return
    currentNumbers.value.push({ red: [null, null, null, null, null, null], blue: null })
  }

  function removeNumber(index) {
    currentNumbers.value.splice(index, 1)
  }

  function setNumber(index, ballType, ballIndex, value) {
    const num = value === '' ? null : parseInt(value)
    if (ballType === 'red') {
      currentNumbers.value[index].red[ballIndex] = num
    } else {
      currentNumbers.value[index].blue = num
    }
  }

  function validateNumber(group) {
    const errors = []
    const redSet = new Set()

    for (let i = 0; i < 6; i++) {
      if (group.red[i] === null || isNaN(group.red[i])) {
        errors.push(`第${i + 1}个红球不能为空`)
      } else if (group.red[i] < 1 || group.red[i] > 33) {
        errors.push(`第${i + 1}个红球必须在1-33之间`)
      } else if (redSet.has(group.red[i])) {
        errors.push(`第${i + 1}个红球与前面的重复`)
      }
      redSet.add(group.red[i])
    }

    if (group.blue === null || isNaN(group.blue)) {
      errors.push('蓝球不能为空')
    } else if (group.blue < 1 || group.blue > 16) {
      errors.push('蓝球必须在1-16之间')
    }

    return errors
  }

  function validateAll() {
    const allErrors = []
    for (let i = 0; i < currentNumbers.value.length; i++) {
      const errors = validateNumber(currentNumbers.value[i])
      if (errors.length > 0) {
        allErrors.push({ index: i, errors })
      }
    }
    return allErrors
  }

  function isFormValid() {
    return currentNumbers.value.length > 0 && validateAll().length === 0
  }

  async function loadSaved() {
    try {
      const { data } = await numbersApi.getSaved()
      savedNumbers.value = data.numbers.map(n => ({
        id: n.id,
        red: n.red,
        blue: n.blue,
      }))
    } catch {
      savedNumbers.value = []
    }
  }

  async function saveNumbers() {
    const formatted = currentNumbers.value.map(n => ({
      red: n.red,
      blue: n.blue,
    }))
    await numbersApi.save(formatted)
    await loadSaved()
  }

  async function deleteSaved(id) {
    await numbersApi.deleteNumber(id)
    await loadSaved()
  }

  function loadToCurrent(saved) {
    currentNumbers.value = saved.map(n => ({
      red: [...n.red],
      blue: n.blue,
    }))
  }

  return {
    currentNumbers,
    savedNumbers,
    addNumber,
    removeNumber,
    setNumber,
    validateNumber,
    validateAll,
    isFormValid,
    loadSaved,
    saveNumbers,
    deleteSaved,
    loadToCurrent,
  }
})
