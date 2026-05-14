import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const lotteryApi = {
  getRecent(count = 20) {
    return api.get('/lottery/recent', { params: { count } })
  }
}

export const authApi = {
  getQRCode() {
    return api.post('/auth/qrcode')
  },
  checkStatus(sceneStr) {
    return api.get('/auth/status', { params: { sceneStr } })
  },
  logout() {
    return api.post('/auth/logout')
  }
}

export const numbersApi = {
  getSaved() {
    return api.get('/numbers')
  },
  save(numbers) {
    return api.post('/numbers', { numbers })
  },
  deleteNumber(id) {
    return api.delete(`/numbers/${id}`)
  }
}

export default api
