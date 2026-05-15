<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">邮箱登录</h2>
      <p class="login-subtitle">登录后自动同步您的号码组</p>

      <div class="input-section">
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
        <div class="input-group">
          <label class="input-label">密码</label>
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            class="password-input"
            :disabled="isLoading"
          />
        </div>
        <button
          class="btn-login"
          @click="handleLogin"
          :disabled="isLoading || !isValidEmail || !password"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

async function handleLogin() {
  if (!isValidEmail.value || !password.value) return
  
  isLoading.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), password: password.value }),
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
.password-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.email-input:focus,
.password-input:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.email-input:disabled,
.password-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-login {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  background: #e53935;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login:hover:not(:disabled) {
  background: #c62828;
}

.btn-login:disabled {
  opacity: 0.6;
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
}
</style>
