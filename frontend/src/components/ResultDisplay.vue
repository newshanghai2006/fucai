<template>
  <div v-if="compareResults.length > 0" class="result-section">
    <div class="section-title">中奖结果</div>

    <div class="draw-info">
      <span class="label">开奖号码：</span>
      <span class="draw-balls">
        <span v-for="n in drawInfo.red" :key="'d-' + n" class="ball red">{{ String(n).padStart(2, '0') }}</span>
        <span class="plus">+</span>
        <span class="ball blue">{{ String(drawInfo.blue).padStart(2, '0') }}</span>
      </span>
    </div>

    <div class="result-list">
      <div
        v-for="(result, i) in compareResults"
        :key="i"
        class="result-line"
        :class="{ 'is-win': result.won }"
      >
        <span class="group-index">第{{ i + 1 }}组</span>
        <span class="result-balls">
          <span v-for="n in result.red" :key="n" class="ball red tiny">{{ String(n).padStart(2, '0') }}</span>
          <span class="plus">+</span>
          <span class="ball blue tiny">{{ String(result.blue).padStart(2, '0') }}</span>
        </span>
        <span class="arrow">→</span>
        <span class="result-badge" :class="result.won ? 'won' : 'lost'">
          {{ result.name }}
        </span>
        <span v-if="result.won" class="prize">+{{ formatPrize(result.prize) }}</span>
        <span v-else class="prize-none">+0元</span>
      </div>
    </div>

    <div class="total-prize" :class="{ 'has-win': summary.totalWinCount > 0 }">
      <div class="total-row">
        <span class="total-label">总奖金</span>
        <span class="total-value">{{ formatPrize(summary.totalPrize) }}</span>
      </div>
      <div class="count-row">
        共 <strong>{{ summary.totalWinCount }}</strong> 组中奖
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResultStore } from '../stores/result'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const resultStore = useResultStore()
const { compareResults, summary, drawInfo } = storeToRefs(resultStore)

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
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
  margin-top: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #e53935;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #e53935, #ff6b6b);
  border-radius: 2px;
}

.draw-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f3f4f6 100%);
  border-radius: 10px;
  margin-bottom: 20px;
}

.label {
  font-size: 14px;
  color: #888;
  font-weight: 500;
  white-space: nowrap;
}

.draw-balls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.result-line {
  padding: 14px 16px;
  border-radius: 10px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  transition: background 0.2s;
  border: 1px solid #eee;
}

.result-line.is-win {
  background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
  border-color: #ffe082;
}

.group-index {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
  background: #eee;
  padding: 4px 10px;
  border-radius: 6px;
}

.result-balls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.arrow {
  color: #ccc;
  font-size: 16px;
}

.result-badge {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

.result-badge.won {
  background: #ffebee;
  color: #e53935;
}

.result-badge.lost {
  color: #bbb;
}

.prize {
  font-size: 15px;
  font-weight: 700;
  color: #e53935;
}

.prize-none {
  font-size: 14px;
  color: #ccc;
}

.total-prize {
  padding: 18px 20px;
  border-radius: 10px;
  background: #f8f9fa;
  border: 1px solid #eee;
}

.total-prize.has-win {
  background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
  border-color: #ffe082;
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total-label {
  font-size: 15px;
  color: #666;
  font-weight: 500;
}

.total-value {
  font-size: 28px;
  font-weight: 800;
  color: #e53935;
}

.count-row {
  font-size: 14px;
  color: #999;
}

.count-row strong {
  color: #e53935;
}

.ball {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  color: white;
}

.ball.red {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  box-shadow: 0 2px 4px rgba(229, 57, 53, 0.25);
}

.ball.blue {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.25);
}

.ball.tiny {
  width: 24px;
  height: 24px;
  font-size: 11px;
}

.plus {
  color: #ccc;
  font-size: 14px;
  margin: 0 2px;
}

@media (max-width: 600px) {
  .result-line {
    gap: 8px;
    padding: 12px;
  }

  .group-index {
    font-size: 12px;
    padding: 3px 8px;
  }

  .ball.tiny {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .total-value {
    font-size: 24px;
  }
}
</style>
