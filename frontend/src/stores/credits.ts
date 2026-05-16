import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useCreditsStore = defineStore('credits', () => {
  const balance = ref(0)
  const loading = ref(false)

  async function fetchBalance() {
    loading.value = true
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      balance.value = res.data.remain_quota ?? 0
    } finally {
      loading.value = false
    }
  }

  async function topUp(code: string): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token')
    const res = await axios.post('/api/v1/users/top_up', { token: code }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.success) {
      await fetchBalance()
      return { success: true, message: res.data.message || '充值成功' }
    }
    return { success: false, message: res.data.message || '充值码无效' }
  }

  return { balance, loading, fetchBalance, topUp }
})