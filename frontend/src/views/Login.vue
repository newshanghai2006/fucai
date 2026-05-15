<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">邮箱登录</h2>
      <p class="login-subtitle">输入邮箱和验证码登录</p>

      <div v-if="!codeSent" class="input-section">
        <div class="input-group">
          <label class="input-label">邮箱地址</label>
          <input
            type="email"
            v-model="email"
            placeholder="your@email.com"
            class="email-input"
            :disabled="isLoading"
          />
        </div>
        <button
          class="btn-send"
          @click="sendCode"
          :disabled="isLoading || !isValidEmail"
        >
          {{ isLoading ? '发送中...' : '获取验证码' }}
        </button>
      </div>

      <div v-else class="input-section">
        <div class="input-group">
          <label class="input-label">验证码</label>
          <input
            type="text"
            v-model="code"
            placeholder="6 位数字验证码"
            maxlength="6"
            class="code-input"
            :disabled="isLoading"
          />
        </div>
        <div class="code-hint">
          验证码已发送到 {{ email }}
          <button class="btn-resend" @click="sendCode" :disabled="resendCountdown > 0">
            {{ resendCountdown > 0 ? `${resendCountdown}s 后重发` : '重新发送' }}
          </button>
        </div>
        <button
          class="btn-login"
          @click="handleLogin"
          :disabled="isLoading || code.length !== 6"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </div>

      <div class="login-tips">
        <p>登录后的功能：</p>
        <ul>
          <li>云端保存您的号码组</li>
          <li>多设备同步数据</li>
          <li>历史开奖自动比对</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const code = ref('')
const codeSent = ref(false)
const isLoading = ref(false)
const resendCountdown = ref(0)

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

let countdownTimer = null

function startCountdown() {
  resendCountdown.value = 60
  countdownTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

onMounted(() => {
  return () => {
    if (countdownTimer) clearInterval(countdownTimer)
  }
})

async function sendCode() {
  if (!isValidEmail.value) return
  
  isLoading.value = true
  try {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      codeSent.value = true
      startCountdown()
      alert('验证码已发送，请查看控制台日志')
    } else {
      alert(data.error || '发送失败')
    }
  } catch (err) {
    console.error('发送验证码失败:', err)
    alert('发送失败，请重试')
  } finally {
    isLoading.value = false
  }
}

async function handleLogin() {
  if (code.value.length !== 6) return
  
  isLoading.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), code: code.value }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
      }))
      router.push('/')
    } else {
      alert(data.error || '登录失败')
    }
  } catch (err) {
    console.error('登录失败:', err)
    alert('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: #fff;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.login-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.input-section {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

.email-input,
.code-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.email-input:focus,
.code-input:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.email-input:disabled,
.code-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-send,
.btn-login {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-send {
  background: #1976d2;
  color: white;
}

.btn-send:hover:not(:disabled) {
  background: #1565c0;
}

.btn-login {
  background: #e53935;
  color: white;
}

.btn-login:hover:not(:disabled) {
  background: #c62828;
}

.btn-send:disabled,
.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.code-hint {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.btn-resend {
  padding: 4px 12px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.btn-resend:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-resend:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-tips {
  margin-top: 30px;
  text-align: left;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
}

.login-tips p {
  margin-bottom: 10px;
  font-weight: 500;
}

.login-tips ul {
  margin: 0;
  padding-left: 20px;
}

.login-tips li {
  margin: 6px 0;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .code-hint {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
