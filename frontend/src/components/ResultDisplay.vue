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
        :key="'r-' + i"
        class="result-line"
        :class="{ 'is-win': result.won }"
      >
        <span class="group-index">第{{ i + 1 }}组</span>
        <span class="result-balls">
          <span v-for="n in result.red" :key="'b-' + n" class="ball red tiny">{{ String(n).padStart(2, '0') }}</span>
          <span class="plus">+</span>
          <span class="ball blue tiny">{{ String(result.blue).padStart(2, '0') }}</span>
        </span>
        <span class="arrow">→</span>
        <span class="result-badge" :class="result.won ? 'won' : 'lost'">
          {{ result.name }}
        </span>
        <span v-if="result.won" class="prize">+{{ formatPrize(result.prize) }}</span>
        <span v-else class="prize-none">+0 元</span>
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
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
  margin-top: 8px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #e53935;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 18px;
  background: #e53935;
  border-radius: 1px;
}

.draw-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.label {
  font-size: 13px;
  color: #888;
  font-weight: 500;
  white-space: nowrap;
}

.draw-balls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.result-line {
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  border: 1px solid #eee;
}

.result-line.is-win {
  background: #fff8e1;
  border-color: #ffe082;
}

.group-index {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
  background: #eee;
  padding: 3px 8px;
  border-radius: 4px;
}

.result-balls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.arrow {
  color: #ccc;
  font-size: 14px;
}

.result-badge {
  font-size: 13px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 4px;
}

.result-badge.won {
  background: #ffebee;
  color: #e53935;
}

.result-badge.lost {
  color: #bbb;
}

.prize {
  font-size: 14px;
  font-weight: 700;
  color: #e53935;
}

.prize-none {
  font-size: 13px;
  color: #ccc;
}

.total-prize {
  padding: 16px 18px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #eee;
}

.total-prize.has-win {
  background: #fff8e1;
  border-color: #ffe082;
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}

.total-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.total-value {
  font-size: 24px;
  font-weight: 800;
  color: #e53935;
}

.count-row {
  font-size: 13px;
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
  flex-shrink: 0;
}

.ball.red {
  background: #e53935;
}

.ball.blue {
  background: #1976d2;
}

.ball.tiny {
  width: 22px;
  height: 22px;
  font-size: 10px;
}

.plus {
  color: #ccc;
  font-size: 12px;
  margin: 0 2px;
}

@media (max-width: 480px) {
  .result-section {
    padding: 14px;
  }

  .section-title {
    font-size: 16px;
  }

  .draw-info {
    padding: 10px;
  }

  .ball.tiny {
    width: 20px;
    height: 20px;
    font-size: 9px;
  }

  .total-value {
    font-size: 20px;
  }

  .result-line {
    padding: 10px;
    gap: 6px;
  }

  .group-index {
    font-size: 12px;
    padding: 2px 6px;
  }
}
</style>
