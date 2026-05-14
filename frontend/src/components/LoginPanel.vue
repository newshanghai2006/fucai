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
      <div class="qrcode-container">
        <img :src="qrcodeUrl" alt="扫码登录" class="qrcode" />
        <p class="qrcode-hint">
          {{ loginStatus === 'pending' ? '请使用微信扫码' : '已扫码，请确认登录' }}
        </p>
      </div>
    </template>
    <template v-else-if="loginStatus === 'expired'">
      <p class="expired">二维码已过期</p>
      <button class="btn-login" @click="handleLogin">重新获取</button>
    </template>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { isLoggedIn, user, loginStatus, qrcodeUrl } = storeToRefs(userStore)

async function handleLogin() {
  await userStore.startLogin()
}

async function handleLogout() {
  await userStore.logout()
}
</script>

<style scoped>
.login-panel {
  display: flex;
  align-items: center;
}

.btn-login {
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.btn-login:hover {
  background: rgba(255,255,255,0.3);
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
  background: rgba(255,255,255,0.3);
}

.nickname {
  font-size: 14px;
}

.btn-logout {
  padding: 4px 12px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
}

.qrcode-container {
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-align: center;
  z-index: 100;
}

.qrcode {
  width: 150px;
  height: 150px;
}

.qrcode-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #666;
}

.expired {
  color: #e53935;
  font-size: 14px;
}
</style>
