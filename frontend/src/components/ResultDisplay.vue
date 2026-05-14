<template>
  <div v-if="compareResults.length > 0" class="result-display">
    <div class="selected-period">
      <span class="period-label">第 {{ selectedPeriod.period }} 期（{{ selectedPeriod.date }}）</span>
      <span class="period-number">开奖号码:</span>
      <span v-for="r in drawRed" :key="r" class="ball red small">{{ String(r).padStart(2, '0') }}</span>
      <span class="separator">+</span>
      <span class="ball blue small">{{ String(drawBlue).padStart(2, '0') }}</span>
    </div>

    <div class="summary">
      <h2>中奖汇总</h2>
      <div class="summary-stats">
        <span class="stat">中奖组数: <strong>{{ summary.totalWinCount }}</strong> 组</span>
        <span class="stat">总奖金: <strong>{{ formatPrize(summary.totalPrize) }}</strong></span>
      </div>
    </div>

    <table class="result-table">
      <thead>
        <tr>
          <th>组号</th>
          <th>投注号码</th>
          <th>红球匹配</th>
          <th>蓝球匹配</th>
          <th>中奖等级</th>
          <th>奖金</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(result, ri) in compareResults" :key="ri" :class="{ 'is-win': result.won }">
          <td>第 {{ ri + 1 }} 组</td>
          <td>
            <span v-for="r in result.red" :key="r" class="ball red tiny">{{ String(r).padStart(2, '0') }}</span>
            <span class="separator">+</span>
            <span class="ball blue tiny">{{ String(result.blue).padStart(2, '0') }}</span>
          </td>
          <td>{{ result.redMatch }}/6</td>
          <td>{{ result.blueMatch ? '中' : '未中' }}</td>
          <td class="result-cell">
            <template v-if="result.won">
              <span class="prize-name" :class="'level-' + result.level">{{ result.name }}</span>
            </template>
            <template v-else>
              <span class="no-prize">未中奖</span>
            </template>
          </td>
          <td class="prize-amount-cell">
            <template v-if="result.won">
              {{ formatPrize(result.prize) }}
            </template>
            <template v-else>-</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useResultStore } from '../stores/result'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const resultStore = useResultStore()
const { compareResults, summary, selectedPeriod } = storeToRefs(resultStore)

const drawRed = computed(() => compareResults.value[0]?.drawRed || [])
const drawBlue = computed(() => compareResults.value[0]?.drawBlue || 0)

function formatPrize(amount) {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(0) + '万元'
  }
  return amount + '元'
}
</script>

<style scoped>
.result-display {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.selected-period {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.period-label {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.period-number {
  color: #666;
  margin-left: 8px;
}

.summary {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #eee;
}

.summary h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #e53935;
}

.summary-stats {
  display: flex;
  gap: 24px;
  font-size: 16px;
}

.stat strong {
  color: #e53935;
  font-size: 20px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.result-table th,
.result-table td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.result-table th {
  background: #f5f5f5;
  font-weight: bold;
  color: #666;
}

.result-table tr.is-win {
  background: #fff8e1;
}

.result-table tr:hover {
  background: #f8f9fa;
}

.result-cell {
  font-weight: bold;
}

.prize-name {
  display: block;
}

.prize-amount-cell {
  color: #e53935;
  font-weight: bold;
}

.no-prize {
  color: #999;
}

.level-1 { color: #ff6f00; }
.level-2 { color: #ff8f00; }
.level-3 { color: #e53935; }
.level-4 { color: #1976d2; }
.level-5 { color: #4caf50; }
.level-6 { color: #9e9e9e; }
.level-7 { color: #ff9800; }

.ball {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
}

.ball.red { background: #e53935; }
.ball.blue { background: #1976d2; }

.ball.small { width: 24px; height: 24px; font-size: 12px; }
.ball.tiny { width: 20px; height: 20px; font-size: 10px; }

.separator {
  color: #999;
  margin: 0 2px;
}
</style>
