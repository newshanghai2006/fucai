<template>
  <div class="number-input">
    <h2>输入号码组 <span class="hint">(最多10组)</span></h2>

    <div v-for="(group, gi) in currentNumbers" :key="gi" class="number-group">
      <div class="group-header">
        <span class="group-label">第 {{ gi + 1 }} 组</span>
        <button v-if="currentNumbers.length > 1" class="btn-remove" @click="handleRemove(gi)">删除</button>
      </div>

      <div class="balls-row">
        <div class="ball-input red-ball" v-for="(ball, bi) in group.red" :key="bi">
          <label>红{{ bi + 1 }}</label>
          <input
            type="number"
            min="1"
            max="33"
            :value="ball"
            @input="handleInput(gi, 'red', bi, $event.target.value)"
            :class="{ 'has-error': getGroupErrors(gi).includes(bi) }"
          />
        </div>
        <span class="separator">+</span>
        <div class="ball-input blue-ball">
          <label>蓝球</label>
          <input
            type="number"
            min="1"
            max="16"
            :value="group.blue"
            @input="handleInput(gi, 'blue', 0, $event.target.value)"
            :class="{ 'has-error': getBlueError(gi) }"
          />
        </div>
      </div>

      <div v-if="getErrorMessages(gi).length > 0" class="error-messages">
        <span v-for="(msg, mi) in getErrorMessages(gi)" :key="mi" class="error">{{ msg }}</span>
      </div>
    </div>

    <button v-if="currentNumbers.length < 10" class="btn-add" @click="addNumber">+ 添加一组</button>
  </div>
</template>

<script setup>
import { useNumbersStore } from '../stores/numbers'
import { storeToRefs } from 'pinia'

const numbersStore = useNumbersStore()
const { currentNumbers } = storeToRefs(numbersStore)
const { addNumber, removeNumber, setNumber } = numbersStore

function handleInput(groupIndex, ballType, ballIndex, value) {
  setNumber(groupIndex, ballType, ballIndex, value)
}

function handleRemove(index) {
  removeNumber(index)
}

function getGroupErrors(gi) {
  const group = currentNumbers.value[gi]
  const redSet = new Set()
  const errors = []

  for (let i = 0; i < 6; i++) {
    if (group.red[i] !== null && !isNaN(group.red[i])) {
      if (group.red[i] < 1 || group.red[i] > 33) {
        errors.push(i)
      } else if (redSet.has(group.red[i])) {
        errors.push(i)
      }
      redSet.add(group.red[i])
    }
  }
  return errors
}

function getBlueError(gi) {
  const group = currentNumbers.value[gi]
  return group.blue !== null && (group.blue < 1 || group.blue > 16)
}

function getErrorMessages(gi) {
  const errors = numbersStore.validateNumber(currentNumbers.value[gi])
  return errors
}
</script>

<style scoped>
.number-input {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.number-input h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.hint {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.number-group {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.number-group:last-of-type {
  border-bottom: none;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.group-label {
  font-weight: bold;
  color: #666;
}

.btn-remove {
  background: none;
  border: none;
  color: #e53935;
  cursor: pointer;
  font-size: 14px;
}

.btn-remove:hover {
  text-decoration: underline;
}

.balls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ball-input {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ball-input label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.ball-input input {
  width: 44px;
  height: 44px;
  text-align: center;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 50%;
  outline: none;
  transition: border-color 0.2s;
}

.red-ball input:focus {
  border-color: #e53935;
}

.blue-ball input:focus {
  border-color: #1976d2;
}

.ball-input input.has-error {
  border-color: #e53935;
  background: #ffebee;
}

.separator {
  font-size: 20px;
  color: #999;
  margin-top: 16px;
}

.error-messages {
  margin-top: 8px;
}

.error {
  color: #e53935;
  font-size: 12px;
  margin-right: 12px;
}

.btn-add {
  margin-top: 12px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.btn-add:hover {
  background: #e8e8e8;
  border-color: #999;
}
</style>
