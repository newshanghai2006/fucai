<template>
  <div v-if="compareResults.length > 0" class="result-display">
    <div class="summary">
      <h2>中奖汇总</h2>
      <div class="summary-stats">
        <span class="stat">中奖次数: <strong>{{ summary.totalWinCount }}</strong> 次</span>
        <span class="stat">总奖金: <strong>{{ formatPrize(summary.totalPrize) }}</strong></span>
      </div>
    </div>

    <div v-for="(group, gi) in compareResults" :key="gi" class="group-result">
      <h3>
        第 {{ gi + 1 }} 组:
        <span v-for="r in group.red" :key="r" class="ball red small">{{ String(r).padStart(2, '0') }}</span>
        <span class="separator">+</span>
        <span class="ball blue small">{{ String(group.blue).padStart(2, '0') }}</span>
      </h3>

      <div class="table-wrapper">
        <table class="result-table">
          <thead>
            <tr>
              <th>期号</th>
              <th>开奖日期</th>
              <th>开奖号码</th>
              <th>红球匹配</th>
              <th>蓝球匹配</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(period, pi) in group.periods" :key="pi" :class="{ 'is-win': period.won }">
              <td>{{ period.period }}</td>
              <td>{{ period.drawDate }}</td>
              <td>
                <span v-for="r in period.drawRed" :key="r" class="ball red tiny">{{ String(r).padStart(2, '0') }}</span>
                <span class="ball blue tiny">{{ String(period.drawBlue).padStart(2, '0') }}</span>
              </td>
              <td>{{ period.redMatch }}/6</td>
              <td>{{ period.blueMatch ? '中' : '未中' }}</td>
              <td class="result-cell">
                <template v-if="period.won">
                  <span class="prize-name" :class="'level-' + period.level">{{ period.name }}</span>
                  <span class="prize-amount">+{{ formatPrize(period.prize) }}</span>
                </template>
                <template v-else>
                  <span class="no-prize">未中奖</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResultStore } from '../stores/result'
import { storeToRefs } from 'pinia'

const resultStore = useResultStore()
const { compareResults, summary } = storeToRefs(resultStore)

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

.group-result {
  margin-bottom: 24px;
}

.group-result h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.table-wrapper {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.result-table th,
.result-table td {
  padding: 8px 12px;
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

.prize-amount {
  color: #e53935;
  font-size: 12px;
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
