<template>
  <div class="saved-numbers" v-if="isLoggedIn && savedNumbers.length > 0">
    <h2>已保存的号码组</h2>
    <div class="saved-list">
      <div v-for="n in savedNumbers" :key="n.id" class="saved-item">
        <div class="saved-balls">
          <span v-for="r in n.red" :key="r" class="ball red">{{ String(r).padStart(2, '0') }}</span>
          <span class="separator">+</span>
          <span class="ball blue">{{ String(n.blue).padStart(2, '0') }}</span>
        </div>
        <div class="saved-actions">
          <button class="btn-use" @click="handleUse(n)">使用</button>
          <button class="btn-delete" @click="handleDelete(n.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNumbersStore } from '../stores/numbers'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const numbersStore = useNumbersStore()
const userStore = useUserStore()
const { savedNumbers } = storeToRefs(numbersStore)
const { isLoggedIn } = storeToRefs(userStore)

onMounted(async () => {
  if (isLoggedIn.value) {
    await numbersStore.loadSaved()
  }
})

function handleUse(n) {
  numbersStore.loadToCurrent([n])
}

async function handleDelete(id) {
  await numbersStore.deleteSaved(id)
}
</script>

<style scoped>
.saved-numbers {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.saved-numbers h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.saved-balls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ball {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.ball.red {
  background: #e53935;
}

.ball.blue {
  background: #1976d2;
}

.separator {
  color: #999;
  margin: 0 4px;
}

.saved-actions {
  display: flex;
  gap: 8px;
}

.btn-use {
  padding: 6px 12px;
  background: #4caf50;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-use:hover {
  background: #43a047;
}

.btn-delete {
  padding: 6px 12px;
  background: none;
  border: 1px solid #e53935;
  border-radius: 4px;
  color: #e53935;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete:hover {
  background: #ffebee;
}
</style>
