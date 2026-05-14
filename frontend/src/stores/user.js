import { defineStore } from 'pinia'
import { authApi } from '../api'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loginStatus = ref('idle')
  const sceneStr = ref('')
  const qrcodeUrl = ref('')
  let pollTimer = null

  const isLoggedIn = computed(() => !!token.value)

  async function startLogin() {
    loginStatus.value = 'pending'
    const { data } = await authApi.getQRCode()
    sceneStr.value = data.sceneStr
    qrcodeUrl.value = data.qrcodeUrl
    pollLoginStatus()
  }

  function pollLoginStatus() {
    pollTimer = setInterval(async () => {
      const { data } = await authApi.checkStatus(sceneStr.value)
      if (data.status === 'success') {
        clearInterval(pollTimer)
        loginStatus.value = 'success'
        token.value = data.token
        user.value = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else if (data.status === 'expired') {
        clearInterval(pollTimer)
        loginStatus.value = 'expired'
      } else {
        loginStatus.value = data.status
      }
    }, 1000)
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      token.value = ''
      user.value = null
      loginStatus.value = 'idle'
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  return {
    token,
    user,
    loginStatus,
    qrcodeUrl,
    isLoggedIn,
    startLogin,
    logout,
  }
})
