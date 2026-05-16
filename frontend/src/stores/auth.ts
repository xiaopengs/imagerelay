import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<{ id: number; email: string; display_name?: string; status?: string } | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  async function fetchUserInfo() {
    if (!token.value) return
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    try {
      const res = await api.get('/users/me')
      userInfo.value = res.data
    } catch {
      logout()
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post('/users/login', { email, password })
    setToken(res.data.token)
    await fetchUserInfo()
  }

  async function register(email: string, password: string) {
    const res = await api.post('/users/register', { email, password })
    setToken(res.data.token)
    await fetchUserInfo()
  }

  return { token, userInfo, isLoggedIn, login, register, logout, fetchUserInfo, setToken }
})