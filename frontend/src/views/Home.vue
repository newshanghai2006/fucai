<template>
  <div class="home">
    <SavedNumbers />
    <NumberInput />

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
import { computed } from 'vue'
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
const { isLoading, error: resultError, compareResults } = storeToRefs(resultStore)

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
