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
      <button class="btn-login" @click="handleLogin">微信扫码登录</button>
    </template>
    <template v-else-if="loginStatus === 'pending' || loginStatus === 'scanned'">
      <div class="qrcode-popover" v-if="showQR">
        <div class="qrcode-backdrop" @click="showQR = false"></div>
        <div class="qrcode-content">
          <img :src="qrcodeUrl" alt="扫码登录" class="qrcode" />
          <p class="qrcode-hint">
            {{ loginStatus === 'pending' ? '请使用微信扫码' : '已扫码，请确认登录' }}
          </p>
          <button class="btn-close" @click="showQR = false">关闭</button>
        </div>
      </div>
      <button class="btn-login" @click="showQR = true">登录中...</button>
    </template>
    <template v-else-if="loginStatus === 'expired'">
      <button class="btn-login" @click="handleLogin">重新获取</button>
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
  padding: 6px 14px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  font-size: 13px;
}

.btn-login:hover {
  background: #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f5f5;
}

.nickname {
  font-size: 13px;
  color: #666;
}

.btn-logout {
  padding: 4px 10px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
  font-size: 12px;
}

.btn-logout:hover {
  border-color: #e53935;
  color: #e53935;
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
  background: rgba(0,0,0,0.4);
}

.qrcode-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.qrcode {
  width: 180px;
  height: 180px;
}

.qrcode-hint {
  margin: 12px 0;
  font-size: 14px;
  color: #666;
}

.btn-close {
  padding: 6px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-close:hover {
  background: #eee;
}
</style>
