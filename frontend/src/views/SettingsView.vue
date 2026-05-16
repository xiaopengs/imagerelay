<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '@/api/user'

// Tab: profile | apikeys | recharge
const activeTab = ref<'profile' | 'apikeys' | 'recharge'>('profile')

// Profile
const displayName = ref('')
const email = ref('')
const savingProfile = ref(false)
const profileMsg = ref('')

// API Keys
interface TokenItem {
  id: number
  name: string
  token: string
  createdAt: string
}

const tokens = ref<TokenItem[]>([])
const loadingTokens = ref(false)

// Recharge
const topUpCode = ref('')
const topUpLoading = ref(false)
const topUpMsg = ref('')
const topUpType = ref<'success' | 'error'>('success')

onMounted(async () => {
  await loadProfile()
  await loadTokens()
})

async function loadProfile() {
  try {
    const res = await userApi.getMe()
    const data = res.data
    email.value = data.email || ''
    displayName.value = data.display_name || ''
  } catch {
    // fail silently
  }
}

async function saveProfile() {
  savingProfile.value = true
  profileMsg.value = ''
  try {
    // One API PUT /users/me to update display_name
    const res = await fetch('/api/v1/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ display_name: displayName.value })
    })
    if (res.ok) {
      profileMsg.value = '保存成功'
      profileMsg.value = '保存成功'
    } else {
      profileMsg.value = '保存失败'
    }
  } catch {
    profileMsg.value = '保存失败'
  } finally {
    savingProfile.value = false
  }
}

async function loadTokens() {
  loadingTokens.value = true
  try {
    const res = await userApi.getTokens()
    tokens.value = (res.data.data || []).map((t: Record<string, unknown>) => ({
      id: t.id as number,
      name: t.name as string || 'API Key',
      token: t.token as string || (t.key as string) || '',
      createdAt: t.created_at as string || ''
    }))
  } catch {
    tokens.value = []
  } finally {
    loadingTokens.value = false
  }
}

async function createToken() {
  try {
    const res = await userApi.createToken()
    const newToken = res.data
    // newToken may be { id, name, key } or just the key string
    const key = newToken.key || newToken.token || newToken
    const id = newToken.id || Date.now()
    tokens.value.unshift({
      id,
      name: `Key ${new Date().toLocaleString()}`,
      token: key,
      createdAt: new Date().toISOString()
    })
  } catch {
    // fail silently
  }
}

async function deleteToken(id: number) {
  try {
    await userApi.deleteToken(id)
    tokens.value = tokens.value.filter(t => t.id !== id)
  } catch {
    // fail silently
  }
}

function copyToken(token: string) {
  navigator.clipboard.writeText(token).catch(() => {})
}

function maskToken(token: string) {
  if (!token) return '••••••••'
  if (token.length <= 10) return token
  return token.slice(0, 6) + '••••••••' + token.slice(-4)
}

async function handleTopUp() {
  if (!topUpCode.value.trim()) return
  topUpLoading.value = true
  topUpMsg.value = ''
  try {
    const res = await userApi.topUp(topUpCode.value.trim())
    topUpType.value = 'success'
    topUpMsg.value = '充值成功！积分已到账'
    topUpCode.value = ''
  } catch (err: unknown) {
    topUpType.value = 'error'
    const errObj = err as { response?: { data?: { message?: string } } }
    topUpMsg.value = errObj?.response?.data?.message || '充值失败，验证码无效'
  } finally {
    topUpLoading.value = false
  }
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-white mb-6">个人设置</h1>

    <!-- Tab 切换 -->
    <div class="flex gap-1 bg-[#141420] rounded-xl p-1 mb-6">
      <button
        v-for="tab in [
          { key: 'profile', label: '个人信息' },
          { key: 'apikeys', label: 'API Keys' },
          { key: 'recharge', label: '充值' }
        ] as const"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
        :class="activeTab === tab.key
          ? 'bg-[#7c6af5] text-white'
          : 'text-gray-400 hover:text-white'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 个人信息 Tab -->
    <div v-if="activeTab === 'profile'" class="space-y-5">
      <div>
        <label class="block text-sm text-gray-400 mb-2">邮箱</label>
        <input
          v-model="email"
          type="email"
          readonly
          class="w-full bg-[#0a0a0f] border border-[#7c6af5]/20 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed outline-none"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-2">显示名称</label>
        <input
          v-model="displayName"
          type="text"
          placeholder="给自己起个昵称"
          class="w-full bg-[#0a0a0f] border border-[#7c6af5]/30 rounded-xl px-4 py-3 text-white outline-none focus:border-[#7c6af5] transition-colors"
        />
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="saveProfile"
          :disabled="savingProfile"
          class="px-6 py-2.5 bg-[#7c6af5] hover:bg-[#6b59e8] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
        >
          {{ savingProfile ? '保存中...' : '保存' }}
        </button>
        <span v-if="profileMsg" class="text-sm" :class="profileMsg.includes('成功') ? 'text-green-400' : 'text-red-400'">
          {{ profileMsg }}
        </span>
      </div>
    </div>

    <!-- API Keys Tab -->
    <div v-if="activeTab === 'apikeys'" class="space-y-4">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-400">使用 API Key 访问 API，可代替邮箱密码认证</p>
        <button
          @click="createToken"
          class="px-4 py-2 bg-[#7c6af5] hover:bg-[#6b59e8] text-white rounded-xl text-sm font-medium transition-colors"
        >
          + 新建 Key
        </button>
      </div>

      <div v-if="loadingTokens" class="text-center py-8 text-gray-500 text-sm">加载中...</div>

      <div v-else-if="tokens.length === 0" class="text-center py-12 text-gray-500">
        <div class="text-3xl mb-3">🔑</div>
        <p class="text-sm">还没有 API Key</p>
        <button @click="createToken" class="mt-3 text-sm text-primary hover:underline">创建一个</button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="tk in tokens"
          :key="tk.id"
          class="bg-[#0a0a0f] border border-[#7c6af5]/15 rounded-xl p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-white font-medium">{{ tk.name }}</span>
            <span class="text-xs text-gray-600">{{ formatDate(tk.createdAt) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <code class="text-xs text-gray-500 font-mono select-all">{{ maskToken(tk.token) }}</code>
            <div class="flex gap-2">
              <button
                @click="copyToken(tk.token)"
                class="text-xs px-3 py-1 rounded-lg bg-[#7c6af5]/10 text-primary hover:bg-[#7c6af5]/20 transition-colors"
              >
                复制
              </button>
              <button
                @click="deleteToken(tk.id)"
                class="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 充值 Tab -->
    <div v-if="activeTab === 'recharge'" class="space-y-5 max-w-sm">
      <div>
        <label class="block text-sm text-gray-400 mb-2">充值码</label>
        <input
          v-model="topUpCode"
          type="text"
          placeholder="请输入充值码"
          class="w-full bg-[#0a0a0f] border border-[#7c6af5]/30 rounded-xl px-4 py-3 text-white outline-none focus:border-[#7c6af5] transition-colors font-mono tracking-wider"
          @keydown.enter="handleTopUp"
        />
      </div>
      <button
        @click="handleTopUp"
        :disabled="topUpLoading || !topUpCode.trim()"
        class="w-full py-3 bg-[#7c6af5] hover:bg-[#6b59e8] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
      >
        {{ topUpLoading ? '充值中...' : '立即充值' }}
      </button>
      <p v-if="topUpMsg" class="text-sm text-center" :class="topUpType === 'success' ? 'text-green-400' : 'text-red-400'">
        {{ topUpMsg }}
      </p>
    </div>
  </div>
</template>