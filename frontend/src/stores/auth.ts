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
  role?: number
  quota?: number
  used_quota?: number
  request_count?: number
}

export const useAuthStore = defineStore('auth', () => {
  // new-api 登录态 = 会话 Cookie + New-Api-User 头（值为用户 id）
  const userId = ref(localStorage.getItem('userId') || '')
  // API key（relay 生图接口用，sk-xxx 格式）
  const apiKey = ref(localStorage.getItem('apiKey') || '')
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!userId.value)
  const balance = computed(() => user.value?.quota ?? 0)

  function setUserId(id: string) {
    userId.value = id
    localStorage.setItem('userId', id)
  }

  function setApiKey(key: string) {
    apiKey.value = key
    localStorage.setItem('apiKey', key)
  }

  async function fetchUser() {
    if (!userId.value) return
    try {
      const res = await authApi.getSelf()
      user.value = res.data?.data ?? null
    } catch {
      logout()
    }
  }

  async function listTokens(): Promise<Array<{ id: number; key: string }>> {
    const res = await userApi.getTokens()
    return res.data?.data?.items ?? []
  }

  async function ensureApiKey() {
    if (apiKey.value) return
    try {
      let items = await listTokens()
      if (!items.length) {
        await userApi.createToken()
        items = await listTokens()
      }
      const id = items[0]?.id
      if (!id) return
      // 列表里的 key 是打码的，需要再取一次完整 key
      const res = await userApi.getTokenKey(id)
      const key = res.data?.data?.key
      if (key) setApiKey(key)
    } catch (e) {
      console.warn('Failed to create API key:', e)
    }
  }

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    const info = res.data?.data
    if (!info?.id) {
      throw new Error(res.data?.message || '登录失败，请检查邮箱和密码')
    }
    setUserId(String(info.id))
    user.value = info
    await fetchUser()
    await ensureApiKey()
  }

  async function register(email: string, password: string) {
    const res = await authApi.register(email, password)
    if (!res.data?.success) {
      throw new Error(res.data?.message || '注册失败')
    }
    // 注册接口不返回用户信息，注册成功后直接登录建立会话
    await login(email, password)
  }

  function logout() {
    userId.value = ''
    apiKey.value = ''
    user.value = null
    localStorage.removeItem('userId')
    localStorage.removeItem('apiKey')
  }

  return {
    userId, apiKey, user, isLoggedIn, balance,
    login, register, logout, fetchUser, ensureApiKey, setUserId, setApiKey,
  }
})
