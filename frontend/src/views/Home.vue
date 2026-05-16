<template>
  <div class="home">
    <div class="header-row">
      <h1 class="page-title">双色球中奖检查器</h1>
      <div v-if="currentUser" class="user-info">
        <img v-if="currentUser.avatar" :src="currentUser.avatar" class="user-avatar" alt="avatar" />
        <div v-else class="user-avatar-placeholder">{{ currentUser.name?.charAt(0).toUpperCase() }}</div>
        <span class="user-name">{{ currentUser.name || currentUser.email }}</span>
        <button class="btn-logout" @click="handleLogout">退出</button>
      </div>
      <router-link v-else to="/login" class="btn-login">登录</router-link>
    </div>

    <div class="section">
      <label class="checkbox-label">
        <input type="checkbox" v-model="useCustomDraw" />
        启用自定义开奖号码
      </label>
    </div>

    <div class="section">
      <div class="section-title">选择最近 20 期官方开奖</div>
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
              :key="'draw-red-' + i"
              type="text"
              maxlength="2"
              v-model="drawRedBalls[i - 1]"
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
              v-model="drawBlueBall"
              :disabled="!useCustomDraw"
              class="ball-input blue"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        号码组
        <span v-if="currentUser && saveStatus" class="save-status">{{ saveStatus }}</span>
        <button v-if="currentUser && hasChanges" class="btn-save" @click="saveNumbers" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存到云端' }}
        </button>
      </div>
      <div v-if="!currentUser" class="login-hint">
        <router-link to="/login">登录</router-link> 后可保存号码组到云端
      </div>
      <div v-for="(group, i) in groups" :key="'group-' + i" class="group-row">
        <span class="group-label">第{{ i + 1 }}组：</span>
        <div class="group-inputs">
          <input
            v-for="j in 6"
            :key="'g' + i + '-red-' + j"
            type="text"
            maxlength="2"
            v-model="group.redBalls[j - 1]"
            class="ball-input red"
          />
          <span class="plus-sign">+</span>
          <input
            type="text"
            maxlength="2"
            v-model="group.blueBall"
            class="ball-input blue"
          />
        </div>
      </div>
    </div>

    <div v-if="validationErrors.length > 0" class="error-section">
      <div v-for="(err, i) in validationErrors" :key="'err-' + i" class="error-line">
        第{{ err.index + 1 }}组：{{ err.errors.join('，') }}
      </div>
    </div>

    <div class="btn-wrapper">
      <button
        class="btn-submit"
        :disabled="!hasValidInput || isLoading"
        @click="handleSubmit"
      >
        <span class="btn-icon">&#10003;</span>
        {{ isLoading ? '核对中...' : '提交核对' }}
      </button>
    </div>

    <ResultDisplay />
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import ResultDisplay from '../components/ResultDisplay.vue'
import { useResultStore } from '../stores/result'
import { storeToRefs } from 'pinia'

const resultStore = useResultStore()
const { periods, selectedPeriod, isLoading } = storeToRefs(resultStore)

const useCustomDraw = ref(false)
const drawRedBalls = reactive(['', '', '', '', '', ''])
const drawBlueBall = ref('')
const validationErrors = ref([])

const groups = reactive([
  { redBalls: ['', '', '', '', '', ''], blueBall: '' },
  { redBalls: ['', '', '', '', '', ''], blueBall: '' },
  { redBalls: ['', '', '', '', '', ''], blueBall: '' },
  { redBalls: ['', '', '', '', '', ''], blueBall: '' },
  { redBalls: ['', '', '', '', '', ''], blueBall: '' },
])

const currentUser = ref(null)
const saveStatus = ref('')
const hasChanges = ref(false)
const isSaving = ref(false)
const originalNumbers = ref([])

function parseNumberArray(arr) {
  return arr.map(s => parseInt(s)).filter(n => !isNaN(n))
}

function validateGroup(g) {
  const errors = []
  const reds = parseNumberArray(g.redBalls)
  if (reds.length !== 6) {
    errors.push('请输入 6 个红球号码')
  } else {
    const invalid = reds.filter(n => n < 1 || n > 33)
    if (invalid.length > 0) errors.push('红球必须在 1-33 之间')
    if (new Set(reds).size !== 6) errors.push('红球号码不能重复')
  }
  const blue = parseInt(g.blueBall)
  if (!g.blueBall || isNaN(blue)) {
    errors.push('请输入蓝球号码')
  } else if (blue < 1 || blue > 16) {
    errors.push('蓝球必须在 1-16 之间')
  }
  return errors
}

const hasValidInput = computed(() => {
  const allErrors = []
  let validCount = 0
  for (let i = 0; i < groups.length; i++) {
    const hasInput = groups[i].redBalls.some(b => b.trim()) || groups[i].blueBall.trim()
    if (hasInput) {
      const errors = validateGroup(groups[i])
      if (errors.length > 0) {
        allErrors.push({ index: i, errors })
      } else {
        validCount++
      }
    }
  }
  validationErrors.value = allErrors
  return validCount > 0 && allErrors.length === 0
})

async function checkAuth() {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  if (token && userStr) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        currentUser.value = data.user
        loadUserNumbers()
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (err) {
      console.error('检查登录状态失败:', err)
    }
  }
}

async function loadUserNumbers() {
  const token = localStorage.getItem('token')
  console.log('[loadUserNumbers] token:', !!token, 'currentUser:', !!currentUser.value)
  if (!token || !currentUser.value) return
  
  try {
    console.log('[loadUserNumbers] fetching /api/numbers...')
    const res = await fetch('/api/numbers', {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('[loadUserNumbers] response status:', res.status)
    if (res.ok) {
      const data = await res.json()
      console.log('[loadUserNumbers] data:', data)
      if (data.numbers && data.numbers.length > 0) {
        for (let i = 0; i < Math.min(data.numbers.length, 5); i++) {
          const n = data.numbers[i]
          groups[i].redBalls = n.red.map(String)
          groups[i].blueBall = String(n.blue)
        }
        originalNumbers.value = JSON.parse(JSON.stringify(groups))
        saveStatus.value = '已加载云端数据'
        setTimeout(() => saveStatus.value = '', 2000)
      }
    }
  } catch (err) {
    console.error('加载号码组失败:', err)
  }
}

async function saveNumbers() {
  if (!currentUser.value) return
  
  console.log('[saveNumbers] user:', currentUser.value)
  const token = localStorage.getItem('token')
  const validGroups = groups.filter(g => {
    const reds = parseNumberArray(g.redBalls)
    const blue = parseInt(g.blueBall)
    return reds.length === 6 && !isNaN(blue)
  })
  console.log('[saveNumbers] validGroups:', validGroups.length)

  if (validGroups.length === 0) {
    alert('没有可保存的有效号码组')
    return
  }

  isSaving.value = true
  try {
    const res = await fetch('/api/numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        numbers: validGroups.map(g => ({
          red: parseNumberArray(g.redBalls),
          blue: parseInt(g.blueBall),
        })),
      }),
    })

    console.log('[saveNumbers] response status:', res.status)
    if (res.ok) {
      saveStatus.value = '已保存'
      hasChanges.value = false
      originalNumbers.value = JSON.parse(JSON.stringify(groups))
      setTimeout(() => saveStatus.value = '', 2000)
    } else {
      alert('保存失败，请重试')
    }
  } catch (err) {
    console.error('保存号码组失败:', err)
    alert('保存失败')
  } finally {
    isSaving.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentUser.value = null
  window.location.href = '/'
}

function onPeriodChange() {
  resultStore.reset()
  if (!useCustomDraw.value && selectedPeriod.value) {
    for (let i = 0; i < 6; i++) {
      drawRedBalls[i] = String(selectedPeriod.value.red[i])
    }
    drawBlueBall.value = String(selectedPeriod.value.blue)
  }
}

function getValidNumbers() {
  const result = []
  for (const g of groups) {
    const reds = parseNumberArray(g.redBalls)
    const blue = parseInt(g.blueBall)
    if (reds.length === 6 && !isNaN(blue)) {
      result.push({ red: reds, blue })
    }
  }
  return result
}

function parseDrawNumbers() {
  const reds = parseNumberArray(drawRedBalls)
  const blue = parseInt(drawBlueBall.value)
  return { red: reds, blue: isNaN(blue) ? 0 : blue }
}

async function handleSubmit() {
  if (!hasValidInput.value) return
  const validNumbers = getValidNumbers()
  const drawNumbers = parseDrawNumbers()
  await resultStore.submitCompare(validNumbers, drawNumbers)
}

watch(groups, () => {
  if (currentUser.value) {
    const current = JSON.stringify(groups)
    const original = JSON.stringify(originalNumbers.value)
    hasChanges.value = current !== original
  }
}, { deep: true })

onMounted(async () => {
  await resultStore.fetchPeriods()
  await checkAuth()
})

watch(selectedPeriod, (newVal) => {
  if (newVal && !useCustomDraw.value) {
    for (let i = 0; i < 6; i++) {
      drawRedBalls[i] = String(newVal.red[i])
    }
    drawBlueBall.value = String(newVal.blue)
  }
}, { immediate: true })
</script>

<style scoped>
.home {
  max-width: 680px;
  margin: 0 auto;
  padding: 16px 12px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #e53935;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e53935;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  padding: 4px 12px;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-logout:hover {
  background: #eee;
}

.btn-login {
  padding: 6px 16px;
  background: #e53935;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.btn-login:hover {
  background: #c62828;
}

.section {
  background: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
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
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 16px;
  background: #e53935;
  border-radius: 1px;
}

.save-status {
  font-size: 12px;
  color: #4caf50;
  font-weight: normal;
}

.btn-save {
  padding: 4px 12px;
  font-size: 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.login-hint a {
  color: #e53935;
  font-weight: 500;
}

select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
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
  gap: 8px;
  flex: 1;
}

.number-field.blue-field {
  flex: 0 0 auto;
}

.number-field label {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.ball-inputs {
  display: flex;
  gap: 6px;
}

.ball-inputs.single {
  justify-content: center;
}

.ball-input {
  width: 36px;
  height: 36px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  border: 2px solid #eee;
  border-radius: 50%;
  outline: none;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

.ball-input.red {
  color: #e53935;
  border-color: #ffcdd2;
  background: #fff5f5;
}

.ball-input.red:focus {
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.15);
}

.ball-input.blue {
  color: #1976d2;
  border-color: #bbdefb;
  background: #f3f8ff;
}

.ball-input.blue:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
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
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.group-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.group-label {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  font-weight: 500;
  min-width: 60px;
}

.group-inputs {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.group-inputs .ball-input {
  width: 30px;
  height: 30px;
  font-size: 13px;
  flex-shrink: 0;
}

.plus-sign {
  font-size: 16px;
  color: #ccc;
  margin: 0 2px;
  flex-shrink: 0;
}

.error-section {
  background: #ffebee;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #ffcdd2;
}

.error-line {
  color: #e53935;
  font-size: 12px;
  margin-bottom: 4px;
}

.btn-wrapper {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.btn-submit {
  width: 100%;
  max-width: 280px;
  padding: 12px 32px;
  background: #4caf50;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-submit:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-submit:not(:disabled):active {
  transform: scale(0.98);
}

@media (max-width: 480px) {
  .home {
    padding: 12px 10px;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 20px;
  }

  .section {
    padding: 14px;
  }

  .ball-input {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .draw-number-row {
    gap: 12px;
  }

  .group-inputs .ball-input {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .group-label {
    min-width: 52px;
    font-size: 12px;
  }

  .group-row {
    gap: 6px;
  }

  .plus-sign {
    font-size: 14px;
    margin: 0 1px;
  }

  .btn-submit {
    padding: 11px 24px;
    font-size: 15px;
  }
}
</style>
