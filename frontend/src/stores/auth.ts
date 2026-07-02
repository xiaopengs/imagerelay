import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'

interface UserInfo {
  id: number
  username: string
  display_name?: string
  email?: string
  status?: number
  quota?: number
  used_quota?: number
  request_count?: number
}

export const useAuthStore = defineStore('auth', () => {
  // session token（管理接口用）
  const token = ref(localStorage.getItem('token') || '')
  // API key（relay 生图接口用，sk-xxx 格式）
  const apiKey = ref(localStorage.getItem('apiKey') || '')
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const balance = computed(() => user.value?.quota ?? 0)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)
  }

  function setApiKey(key: string) {
    apiKey.value = key
    localStorage.setItem('apiKey', key)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await authApi.getSelf()
      user.value = res.data
    } catch {
      logout()
    }
  }

  async function ensureApiKey() {
    if (apiKey.value) return
    try {
      const res = await userApi.createToken()
      if (res.data?.key) {
        setApiKey(res.data.key)
      }
    } catch (e) {
      console.warn('Failed to create API key:', e)
    }
  }

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    // new-api 登录返回 token 或设置 session cookie
    if (res.data?.token) {
      setToken(res.data.token)
    }
    await fetchUser()
    await ensureApiKey()
  }

  async function register(email: string, password: string) {
    const res = await authApi.register(email, password)
    if (res.data?.token) {
      setToken(res.data.token)
    }
    await fetchUser()
    await ensureApiKey()
  }

  function logout() {
    token.value = ''
    apiKey.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('apiKey')
  }

  return {
    token, apiKey, user, isLoggedIn, balance,
    login, register, logout, fetchUser, ensureApiKey, setToken,
  }
})
