<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">登录</h2>
      <p class="login-subtitle">登录后可保存您的号码组</p>

      <button class="btn-github" @click="handleGitHubLogin" :disabled="isLoading">
        <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-4.442 0-.981.355-1.782.931-2.404-.303-.926-.353-1.236-.353-1.236-.516.012-.773.465-.773.465-1.052.83-1.029 2.525-.967 2.865 1.222.692 2.264 1.267 3.096 1.115 1.827-.133 2.664-1.292 2.833-2.326.379-.362.999-.395 1.467-.295.628.131 1.344.557 1.467 1.095.173.748.491 1.482.491 2.534 0 3.121-2.804 4.139-5.475 4.436.328.286.62.853.62 1.726v2.56c0 .325.19.699.811.574C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        {{ isLoading ? '登录中...' : '使用 GitHub 登录' }}
      </button>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

async function handleGitHubLogin() {
  isLoading.value = true
  try {
    const response = await fetch('/api/auth/github')
    const data = await response.json()
    
    if (data.authorizeUrl) {
      window.location.href = data.authorizeUrl
    } else {
      alert('获取授权 URL 失败')
    }
  } catch (err) {
    console.error('GitHub 登录失败:', err)
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

.btn-github {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 24px;
  background: #24292e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-github:hover:not(:disabled) {
  background: #1c2128;
  transform: translateY(-2px);
}

.btn-github:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.github-icon {
  width: 24px;
  height: 24px;
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
