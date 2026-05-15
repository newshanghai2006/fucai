import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/auth/success',
    name: 'AuthSuccess',
    component: {
      template: '<div>登录成功，正在跳转...</div>',
      async mounted() {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        const userStr = params.get('user')
        
        if (token && userStr) {
          localStorage.setItem('token', token)
          localStorage.setItem('user', userStr)
        }
        
        window.location.href = '/'
      },
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
