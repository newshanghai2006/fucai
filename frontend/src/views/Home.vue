<template>
  <div class="home">
    <h1 class="page-title">双色球中奖检查器</h1>

    <div class="section">
      <label class="checkbox-label">
        <input type="checkbox" v-model="useCustomDraw" />
        启用自定义开奖号码
      </label>
    </div>

    <div class="section">
      <div class="section-title">选择最近20期官方开奖</div>
      <select v-model="selectedPeriod" @change="onPeriodChange">
        <option v-for="p in periods" :key="p.period" :value="p">
          第 {{ p.period }} 期（{{ p.date }}）
        </option>
      </select>
    </div>

    <div class="section">
      <div class="section-title">开奖号码</div>
      <div class="draw-number-row">
        <div class="number-field">
          <label>红球</label>
          <div class="ball-inputs">
            <input
              v-for="i in 6"
              :key="'red-' + i"
              type="text"
              maxlength="2"
              :value="parsedDrawRed[i - 1] || ''"
              @input="onDrawRedInput(i - 1, $event.target.value)"
              :disabled="!useCustomDraw"
              class="ball-input red"
            />
          </div>
        </div>
        <div class="number-field blue-field">
          <label>蓝球</label>
          <div class="ball-inputs single">
            <input
              type="text"
              maxlength="2"
              :value="parsedDrawBlue || ''"
              @input="onDrawBlueInput($event.target.value)"
              :disabled="!useCustomDraw"
              class="ball-input blue"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">5组自选号（自动保存）</div>
      <div v-for="(group, i) in groups" :key="i" class="group-row">
        <span class="group-label">第{{ i + 1 }}组：</span>
        <div class="group-inputs">
          <input
            v-for="j in 6"
            :key="j"
            type="text"
            maxlength="2"
            :value="parsedGroup(i, j - 1)"
            @input="onGroupRedInput(i, j - 1, $event.target.value)"
            class="ball-input red"
          />
          <span class="plus-sign">+</span>
          <input
            type="text"
            maxlength="2"
            :value="parsedGroupBlue(i)"
            @input="onGroupBlueInput(i, $event.target.value)"
            class="ball-input blue"
          />
        </div>
      </div>
    </div>

    <div v-if="validationErrors.length > 0" class="error-section">
      <div v-for="(err, i) in validationErrors" :key="i" class="error-line">
        第{{ err.index + 1 }}组：{{ err.errors.join('，') }}
      </div>
    </div>

    <div class="btn-wrapper">
      <button
        class="btn-submit"
        :disabled="!hasValidInput || isLoading"
        @click="handleSubmit"
      >
        <span class="btn-icon">✓</span>
        {{ isLoading ? '核对中...' : '提交核对' }}
      </button>
    </div>

    <ResultDisplay />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ResultDisplay from '../components/ResultDisplay.vue'
import { useNumbersStore } from '../stores/numbers'
import { useResultStore } from '../stores/result'
import { storeToRefs } from 'pinia'

const numbersStore = useNumbersStore()
const resultStore = useResultStore()
const { groups } = numbersStore
const { periods, selectedPeriod, isLoading } = storeToRefs(resultStore)

const useCustomDraw = ref(false)
const drawRawInput = ref('')
const drawBlueRawInput = ref('')
const validationErrors = ref([])

const parsedDrawRed = computed(() => {
  if (!drawRawInput.value) return [null, null, null, null, null, null]
  return drawRawInput.value.split(/[\s,，]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n))
})

const parsedDrawBlue = computed(() => {
  const n = parseInt(drawBlueRawInput.value)
  return isNaN(n) ? null : n
})

const hasValidInput = computed(() => {
  const { validCount, errors } = numbersStore.validateAll()
  validationErrors.value = errors
  return validCount > 0 && errors.length === 0
})

onMounted(async () => {
  await resultStore.fetchPeriods()
})

watch(selectedPeriod, (newVal) => {
  if (newVal && !useCustomDraw.value) {
    drawRawInput.value = newVal.red.join(' ')
    drawBlueRawInput.value = String(newVal.blue)
  }
}, { immediate: true })

function onPeriodChange() {
  resultStore.reset()
  if (!useCustomDraw.value && selectedPeriod.value) {
    drawRawInput.value = selectedPeriod.value.red.join(' ')
    drawBlueRawInput.value = String(selectedPeriod.value.blue)
  }
}

function onDrawRedInput(index, value) {
  const cleaned = value.replace(/[^\d]/g, '')
  const parts = drawRawInput.value.split(/[\s,，]+/).filter(s => s)
  parts[index] = cleaned
  drawRawInput.value = parts.join(' ')

  if (cleaned.length === 2) {
    const inputs = document.querySelectorAll('.draw-number-row .ball-input.red')
    if (inputs[index + 1]) inputs[index + 1].focus()
  }
}

function onDrawBlueInput(value) {
  drawBlueRawInput.value = value.replace(/[^\d]/g, '')
}

function parseGroupInput(index) {
  const g = groups.value[index]
  return g.red.split(/[\s,，]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n))
}

function parsedGroup(groupIndex, ballIndex) {
  const parts = parseGroupInput(groupIndex)
  return parts[ballIndex] ? String(parts[ballIndex]) : ''
}

function parsedGroupBlue(groupIndex) {
  const n = parseInt(groups.value[groupIndex].blue)
  return isNaN(n) ? '' : String(n)
}

function onGroupRedInput(groupIndex, ballIndex, value) {
  const cleaned = value.replace(/[^\d]/g, '')
  const parts = groups.value[groupIndex].red.split(/[\s,，]+/).filter(s => s)
  parts[ballIndex] = cleaned
  groups.value[groupIndex].red = parts.join(' ')

  if (cleaned.length === 2) {
    const row = document.querySelectorAll(`.group-row`)[groupIndex]
    if (row) {
      const inputs = row.querySelectorAll('.ball-input.red')
      if (inputs[ballIndex + 1]) inputs[ballIndex + 1].focus()
    }
  }
}

function onGroupBlueInput(groupIndex, value) {
  groups.value[groupIndex].blue = value.replace(/[^\d]/g, '')
}

function parseDrawNumbers() {
  const reds = drawRawInput.value.split(/[\s,，]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n))
  const blue = parseInt(drawBlueRawInput.value)
  return { red: reds, blue: isNaN(blue) ? 0 : blue }
}

async function handleSubmit() {
  const { validCount, errors } = numbersStore.validateAll()
  validationErrors.value = errors
  if (validCount === 0 || errors.length > 0) return

  const validNumbers = numbersStore.getValidNumbers()
  const drawNumbers = parseDrawNumbers()

  await resultStore.submitCompare(validNumbers, drawNumbers)
}
</script>

<style scoped>
.home {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 28px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input {
  width: 20px;
  height: 20px;
  accent-color: #e53935;
  cursor: pointer;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #e53935, #ff6b6b);
  border-radius: 2px;
}

select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 15px;
  background: #fafafa;
  cursor: pointer;
  transition: border-color 0.2s;
}

select:hover {
  border-color: #ddd;
}

select:focus {
  outline: none;
  border-color: #e53935;
  background: white;
}

.draw-number-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.number-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.number-field.blue-field {
  flex: 0 0 auto;
}

.number-field label {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.ball-inputs {
  display: flex;
  gap: 8px;
}

.ball-inputs.single {
  justify-content: center;
}

.ball-input {
  width: 44px;
  height: 44px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  border: 2px solid #eee;
  border-radius: 50%;
  outline: none;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
}

.ball-input.red:focus {
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.15);
  color: #e53935;
}

.ball-input.red:not(:disabled):not(:focus) {
  border-color: #ffcdd2;
  background: #fff5f5;
  color: #e53935;
}

.ball-input.blue:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
  color: #1976d2;
}

.ball-input.blue:not(:disabled):not(:focus) {
  border-color: #bbdefb;
  background: #f3f8ff;
  color: #1976d2;
}

.ball-input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #eee;
}

.group-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.group-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.group-label {
  font-size: 14px;
  color: #888;
  white-space: nowrap;
  font-weight: 500;
  min-width: 56px;
}

.group-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.plus-sign {
  font-size: 20px;
  color: #ccc;
  margin: 0 4px;
  font-weight: 300;
}

.error-section {
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  border: 1px solid #ffcdd2;
}

.error-line {
  color: #e53935;
  font-size: 13px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-line:last-child {
  margin-bottom: 0;
}

.btn-wrapper {
  display: flex;
  justify-content: center;
  margin: 28px 0;
}

.btn-submit {
  padding: 14px 56px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-icon {
  font-size: 20px;
  font-weight: 700;
}

.btn-submit:disabled {
  background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%);
  cursor: not-allowed;
  box-shadow: none;
}

.btn-submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.35);
}

.btn-submit:not(:disabled):active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .home {
    padding: 16px 12px;
  }

  .draw-number-row {
    flex-direction: column;
    gap: 16px;
  }

  .number-field.blue-field {
    align-self: center;
  }

  .group-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .group-label {
    min-width: auto;
  }

  .group-inputs {
    width: 100%;
    justify-content: center;
  }

  .ball-input {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
}
</style>
