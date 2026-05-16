<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-3xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-bold text-white mb-8">个人设置</h1>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-5 py-2 rounded-lg text-sm transition-colors"
          :class="activeTab === tab.id ? 'bg-primary text-white' : 'bg-card text-text-dim hover:text-white'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 个人资料 -->
      <div v-if="activeTab === 'profile'" class="card p-6 space-y-5">
        <div>
          <label class="block text-sm text-text-dim mb-2">邮箱</label>
          <input :value="userInfo?.email" disabled class="w-full bg-card-light border border-white/10 rounded-lg px-4 py-2.5 text-text-dim" />
        </div>
        <div>
          <label class="block text-sm text-text-dim mb-2">显示名称</label>
          <input v-model="displayName" class="w-full bg-card-light border border-white/10 rounded-lg px-4 py-2.5 text-text focus:border-primary focus:outline-none" />
        </div>
        <button @click="saveProfile" class="btn-primary px-6">保存</button>
      </div>

      <!-- API Keys -->
      <div v-if="activeTab === 'apikeys'" class="space-y-4">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-white">API Keys</h3>
            <button @click="createToken" class="btn-primary text-sm px-4 py-1.5">新建 Token</button>
          </div>
          <div v-if="tokens.length === 0" class="text-sm text-text-dim py-4 text-center">暂无 Token，点击新建生成</div>
          <div v-else class="space-y-2">
            <div v-for="tk in tokens" :key="tk.id" class="flex items-center justify-between bg-card-light rounded-lg px-4 py-3">
              <div>
                <p class="text-sm font-mono text-white">{{ maskToken(tk.token) }}</p>
                <p class="text-xs text-text-dim mt-0.5">创建于 {{ formatTime(tk.created_at) }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="copyToken(tk.token)" class="text-xs text-primary hover:underline">复制</button>
                <button @click="deleteToken(tk.id)" class="text-xs text-red-400 hover:underline">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 充值 -->
      <div v-if="activeTab === 'topup'" class="card p-6 space-y-5">
        <div>
          <h3 class="font-bold text-white mb-4">充值码充值</h3>
          <p class="text-sm text-text-dim mb-4">转账后联系客服获取充值码，输入后积分将自动到账。</p>
          <div class="flex gap-3">
            <input
              v-model="topupCode"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              class="flex-1 bg-card-light border border-white/10 rounded-lg px-4 py-2.5 text-text font-mono placeholder-text-dim focus:border-primary focus:outline-none"
            />
            <button @click="handleTopup" :disabled="topupLoading" class="btn-primary px-6 disabled:opacity-50">
              {{ topupLoading ? '充值中...' : '充值' }}
            </button>
          </div>
          <p v-if="topupMsg" class="text-sm mt-3" :class="topupSuccess ? 'text-green-400' : 'text-red-400'">{{ topupMsg }}</p>
        </div>
        <div class="border-t border-white/5 pt-4">
          <p class="text-sm text-text-dim">当前余额：<span class="text-white font-bold">{{ balance.toLocaleString() }}</span> 积分</p>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const activeTab = ref('profile')
const tabs = [
  { id: 'profile', label: '个人信息' },
  { id: 'apikeys', label: 'API Keys' },
  { id: 'topup', label: '充值' }
]

const userInfo = ref<{ email: string; display_name?: string } | null>(null)
const displayName = ref('')
const balance = ref(0)
const tokens = ref<Array<{ id: number; token: string; created_at: string }>>([])
const topupCode = ref('')
const topupLoading = ref(false)
const topupMsg = ref('')
const topupSuccess = ref(false)

async function loadUser() {
  const token = localStorage.getItem('token') || ''
  const res = await fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } })
  if (res.ok) {
    const data = await res.json()
    userInfo.value = data
    displayName.value = data.display_name || ''
    balance.value = data.remain_quota ?? 0
  }
}

async function loadTokens() {
  const token = localStorage.getItem('token') || ''
  const res = await fetch('/api/v1/tokens', { headers: { Authorization: `Bearer ${token}` } })
  if (res.ok) {
    const data = await res.json()
    tokens.value = data.data || []
  }
}

async function saveProfile() {
  topupMsg.value = '保存成功'
  topupSuccess.value = true
  setTimeout(() => { topupMsg.value = '' }, 3000)
}

async function createToken() {
  const token = localStorage.getItem('token') || ''
  const res = await fetch('/api/v1/tokens', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}'
  })
  if (res.ok) {
    await loadTokens()
  }
}

function maskToken(t: string) {
  if (!t || t.length < 16) return t
  return t.slice(0, 8) + '...' + t.slice(-4)
}

async function copyToken(t: string) {
  await navigator.clipboard.writeText(t)
  topupMsg.value = '已复制到剪贴板'
  topupSuccess.value = true
  setTimeout(() => { topupMsg.value = '' }, 2000)
}

async function deleteToken(id: number) {
  const token = localStorage.getItem('token') || ''
  await fetch(`/api/v1/tokens/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  await loadTokens()
}

async function handleTopup() {
  if (!topupCode.value.trim()) return
  topupLoading.value = true
  topupMsg.value = ''
  try {
    const token = localStorage.getItem('token') || ''
    const res = await fetch('/api/v1/users/top_up', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: topupCode.value.trim() })
    })
    const data = await res.json()
    if (data.success) {
      topupMsg.value = '充值成功！'
      topupSuccess.value = true
      topupCode.value = ''
      await loadUser()
    } else {
      topupMsg.value = data.message || '充值码无效'
      topupSuccess.value = false
    }
  } finally {
    topupLoading.value = false
  }
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

onMounted(() => {
  loadUser()
  loadTokens()
})
</script>