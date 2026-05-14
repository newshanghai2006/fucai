<template>
  <div class="home">
    <SavedNumbers />
    <NumberInput />

    <div class="period-selector">
      <label>选择期数:</label>
      <select v-model="selectedPeriod" @change="handlePeriodChange">
        <option v-for="p in periods" :key="p.period" :value="p">
          第 {{ p.period }} 期（{{ p.date }}）
        </option>
      </select>
    </div>

    <div class="actions">
      <button
        class="btn-submit"
        :disabled="!isFormValid || isLoading"
        @click="handleSubmit"
      >
        {{ isLoading ? '比对中...' : '提交比对' }}
      </button>
      <button
        v-if="isLoggedIn"
        class="btn-save"
        :disabled="!isFormValid"
        @click="handleSave"
      >
        保存号码组
      </button>
      <p v-if="!isLoggedIn" class="save-hint">登录后即可保存号码组</p>
    </div>

    <div v-if="resultError" class="error-alert">
      {{ resultError }}
    </div>

    <ResultDisplay />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NumberInput from '../components/NumberInput.vue'
import SavedNumbers from '../components/SavedNumbers.vue'
import ResultDisplay from '../components/ResultDisplay.vue'
import { useNumbersStore } from '../stores/numbers'
import { useResultStore } from '../stores/result'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const numbersStore = useNumbersStore()
const resultStore = useResultStore()
const userStore = useUserStore()

const { isLoggedIn } = storeToRefs(userStore)
const { currentNumbers, isFormValid } = numbersStore
const { periods, selectedPeriod, isLoading, error: resultError } = storeToRefs(resultStore)

onMounted(async () => {
  await resultStore.fetchPeriods()
})

function handlePeriodChange() {
  resultStore.reset()
}

async function handleSubmit() {
  if (!isFormValid()) return

  const formatted = currentNumbers.map(n => ({
    red: n.red,
    blue: n.blue,
  }))

  await resultStore.submitCompare(formatted)
}

async function handleSave() {
  if (!isLoggedIn.value || !isFormValid()) return
  await numbersStore.saveNumbers()
}
</script>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.period-selector label {
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.period-selector select {
  flex: 1;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #f8f9fa;
  cursor: pointer;
}

.period-selector select:focus {
  outline: none;
  border-color: #e53935;
  background: white;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn-submit {
  padding: 12px 32px;
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  opacity: 0.9;
}

.btn-save {
  padding: 12px 24px;
  background: #4caf50;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-hint {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.error-alert {
  background: #ffebee;
  color: #e53935;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}
</style>
