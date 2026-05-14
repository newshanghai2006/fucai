<template>
  <div v-if="compareResults.length > 0" class="result-section">
    <div class="section-title">中奖结果</div>

    <div class="draw-info">
      开奖号码：红球 {{ drawRedText }} | 蓝球 {{ drawInfo.blue }}
    </div>

    <div class="result-list">
      <div
        v-for="(result, i) in compareResults"
        :key="i"
        class="result-line"
        :class="{ 'is-win': result.won }"
      >
        <span class="group-index">第{{ i + 1 }}组：</span>
        <span class="numbers">
          红[{{ result.red.map(n => String(n).padStart(2, '0')).join(', ') }}]
          蓝{{ String(result.blue).padStart(2, '0') }}
        </span>
        <span class="arrow">→</span>
        <span class="result-text" :class="result.won ? 'won' : 'lost'">
          {{ result.name }}（+{{ formatPrize(result.prize) }}）
        </span>
      </div>
    </div>

    <div class="total-prize">
      总奖金：<strong>{{ formatPrize(summary.totalPrize) }}</strong>
      <span class="total-count">（共 {{ summary.totalWinCount }} 组中奖）</span>
    </div>
  </div>
</template>

<script setup>
import { useResultStore } from '../stores/result'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const resultStore = useResultStore()
const { compareResults, summary, drawInfo } = storeToRefs(resultStore)

const drawRedText = computed(() => {
  if (!drawInfo.value) return ''
  return `[${drawInfo.value.red.map(n => String(n).padStart(2, '0')).join(', ')}]`
})

function formatPrize(amount) {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(0) + '万元'
  }
  return amount + '元'
}
</script>

<style scoped>
.result-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-top: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.draw-info {
  font-size: 14px;
  color: #666;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.result-line {
  padding: 10px 12px;
  border-radius: 6px;
  background: #f8f9fa;
  font-size: 14px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.result-line.is-win {
  background: #fff8e1;
}

.group-index {
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.numbers {
  font-family: 'Courier New', monospace;
  color: #555;
}

.arrow {
  color: #999;
}

.result-text {
  font-weight: bold;
}

.result-text.won {
  color: #e53935;
}

.result-text.lost {
  color: #999;
}

.total-prize {
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-size: 16px;
  color: #333;
}

.total-prize strong {
  color: #e53935;
  font-size: 20px;
}

.total-count {
  color: #999;
  font-size: 14px;
  margin-left: 8px;
}
</style>
