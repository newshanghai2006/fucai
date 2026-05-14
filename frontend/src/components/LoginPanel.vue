<template>
  <div class="login-panel">
    <template v-if="isLoggedIn">
      <div class="user-info">
        <img :src="user.avatar" alt="头像" class="avatar" />
        <span class="nickname">{{ user.nickname }}</span>
        <button class="btn-logout" @click="handleLogout">退出</button>
      </div>
    </template>
    <template v-else-if="loginStatus === 'idle'">
      <button class="btn-login" @click="handleLogin">
        <svg class="login-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        微信登录
      </button>
    </template>
    <template v-else-if="loginStatus === 'pending' || loginStatus === 'scanned'">
      <div class="qrcode-popover" v-if="showQR">
        <div class="qrcode-backdrop" @click="showQR = false"></div>
        <div class="qrcode-content">
          <h3>微信扫码登录</h3>
          <img :src="qrcodeUrl" alt="扫码登录" class="qrcode" />
          <p class="qrcode-hint">
            {{ loginStatus === 'pending' ? '请使用微信扫码' : '已扫码，请确认登录' }}
          </p>
          <button class="btn-close" @click="showQR = false">关闭</button>
        </div>
      </div>
      <button class="btn-login active" @click="showQR = true">登录中...</button>
    </template>
    <template v-else-if="loginStatus === 'expired'">
      <button class="btn-login" @click="handleLogin">二维码过期，重新获取</button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { isLoggedIn, user, loginStatus, qrcodeUrl } = storeToRefs(userStore)
const showQR = ref(false)

async function handleLogin() {
  showQR.value = false
  await userStore.startLogin()
  showQR.value = true
}

async function handleLogout() {
  await userStore.logout()
}
</script>

<style scoped>
.login-panel {
  position: relative;
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-login:hover {
  background: rgba(255,255,255,0.3);
}

.btn-login.active {
  background: rgba(255,255,255,0.3);
}

.login-icon {
  opacity: 0.9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
}

.nickname {
  font-size: 14px;
  color: rgba(255,255,255,0.95);
  font-weight: 500;
}

.btn-logout {
  padding: 5px 12px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.25);
}

.qrcode-popover {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.qrcode-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}

.qrcode-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
}

.qrcode-content h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #333;
}

.qrcode {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.qrcode-hint {
  margin: 16px 0;
  font-size: 14px;
  color: #888;
}

.btn-close {
  padding: 8px 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #eee;
}
</style>
