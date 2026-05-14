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
          <label>红球：</label>
          <input
            type="text"
            v-model="drawRedInput"
            :disabled="!useCustomDraw"
            placeholder="如：09 14 15 16 29 30"
          />
        </div>
        <div class="number-field small">
          <label>蓝球：</label>
          <input
            type="text"
            v-model="drawBlueInput"
            :disabled="!useCustomDraw"
            placeholder="如：10"
          />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">5组自选号（自动保存）</div>
      <div v-for="(group, i) in groups" :key="i" class="group-row">
        <span class="group-label">第{{ i + 1 }}组：</span>
        <input
          type="text"
          v-model="group.red"
          placeholder="红球，用空格或逗号分隔"
        />
        <span class="blue-label">蓝：</span>
        <input
          type="text"
          v-model="group.blue"
          class="blue-input"
          placeholder="蓝球"
        />
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
const { groups, isFormValid } = numbersStore
const { periods, selectedPeriod, compareResults, isLoading, error } = storeToRefs(resultStore)

const useCustomDraw = ref(false)
const drawRedInput = ref('')
const drawBlueInput = ref('')
const validationErrors = ref([])

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
    drawRedInput.value = newVal.red.join(' ')
    drawBlueInput.value = String(newVal.blue)
  }
}, { immediate: true })

function onPeriodChange() {
  resultStore.reset()
  if (!useCustomDraw.value && selectedPeriod.value) {
    drawRedInput.value = selectedPeriod.value.red.join(' ')
    drawBlueInput.value = String(selectedPeriod.value.blue)
  }
}

function parseDrawNumbers() {
  const reds = drawRedInput.value
    .split(/[\s,，]+/)
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n))
  const blue = parseInt(drawBlueInput.value)
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
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 16px;
}

.page-title {
  text-align: center;
  font-size: 24px;
  color: #e53935;
  margin-bottom: 24px;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #e53935;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #f8f9fa;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #e53935;
  background: white;
}

.draw-number-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.number-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.number-field.small {
  flex: 0 0 120px;
}

.number-field label {
  font-size: 14px;
  color: #666;
}

.number-field input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.number-field input:focus {
  outline: none;
  border-color: #e53935;
  background: #fff;
}

.number-field input:disabled {
  background: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.group-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.group-row:last-child {
  margin-bottom: 0;
}

.group-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  min-width: 56px;
}

.group-row input[type="text"] {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.group-row input[type="text"]:focus {
  outline: none;
  border-color: #e53935;
  background: #fff;
}

.blue-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.blue-input {
  width: 80px !important;
  flex: 0 0 80px !important;
  text-align: center;
}

.error-section {
  background: #ffebee;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.error-line {
  color: #e53935;
  font-size: 13px;
  margin-bottom: 4px;
}

.error-line:last-child {
  margin-bottom: 0;
}

.btn-wrapper {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.btn-submit {
  padding: 12px 48px;
  background: #4caf50;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit::before {
  content: '\2713';
  font-size: 18px;
}

.btn-submit:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  background: #43a047;
}

@media (max-width: 600px) {
  .draw-number-row {
    flex-direction: column;
    gap: 10px;
  }

  .number-field.small {
    flex: 1;
  }

  .group-row {
    flex-wrap: wrap;
  }

  .group-label {
    min-width: auto;
  }

  .blue-input {
    width: 60px !important;
    flex: 0 0 60px !important;
  }
}
</style>
