<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">个人设置</h1>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
        :class="activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 个人资料 -->
    <div v-if="activeTab === 'profile'" class="card p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
        <input :value="userInfo?.email" disabled class="input-field opacity-60" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">显示名称</label>
        <input v-model="displayName" class="input-field" />
      </div>
      <button @click="saveProfile" :disabled="saving" class="btn-primary px-6">{{ saving ? '保存中...' : '保存' }}</button>
    </div>

    <!-- API 密钥 -->
    <div v-if="activeTab === 'apikeys'" class="space-y-4">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-800">API 密钥</h3>
          <button @click="createToken" class="btn-primary text-sm !py-1.5 !px-4">新建令牌</button>
        </div>
        <div v-if="tokens.length === 0" class="text-sm text-gray-400 py-4 text-center">暂无令牌，点击新建生成</div>
        <div v-else class="space-y-2">
          <div v-for="tk in tokens" :key="tk.id" class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <p class="text-sm font-mono text-gray-700">{{ maskToken(tk.token) }}</p>
              <p class="text-xs text-gray-400 mt-0.5">创建于 {{ formatTime(tk.created_at) }}</p>
            </div>
            <div class="flex gap-3">
              <button @click="copyToken(tk.token)" class="text-xs text-primary-600 hover:underline">复制</button>
              <button @click="deleteToken(tk.id)" class="text-xs text-red-500 hover:underline">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 充值 -->
    <div v-if="activeTab === 'topup'" class="card p-6 space-y-5">
      <div>
        <h3 class="font-semibold text-gray-800 mb-2">充值码充值</h3>
        <p class="text-sm text-gray-500 mb-4">输入充值码后积分将自动到账。</p>
        <div class="flex gap-3">
          <input
            v-model="topupCode"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            class="flex-1 input-field font-mono"
          />
          <button @click="handleTopup" :disabled="topupLoading" class="btn-primary px-6">
            {{ topupLoading ? '充值中...' : '充值' }}
          </button>
        </div>
        <Transition name="fade">
          <p v-if="topupMsg" class="text-sm mt-3" :class="topupSuccess ? 'text-green-600' : 'text-red-600'">{{ topupMsg }}</p>
        </Transition>
      </div>
      <div class="border-t border-gray-100 pt-4">
        <p class="text-sm text-gray-500">当前余额：<span class="text-gray-800 font-bold">{{ formatBalance(balance) }}</span></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import { formatBalance } from '@/utils/format'
import { userApi } from '@/api/user'
import { useToast } from '@/utils/toast'

const auth = useAuthStore()
const toast = useToast()

const activeTab = ref('profile')
const tabs = [
  { id: 'profile', label: '个人信息' },
  { id: 'apikeys', label: 'API 密钥' },
  { id: 'topup', label: '充值' }
]

const displayName = ref('')
const saving = ref(false)
const tokens = ref<Array<{ id: number; token: string; created_at: string }>>([])
const topupCode = ref('')
const topupLoading = ref(false)
const topupMsg = ref('')
const topupSuccess = ref(false)

const userInfo = computed(() => auth.user)
const balance = computed(() => auth.balance ?? 0)

async function loadUser() {
  await auth.fetchUser()
  if (auth.user) {
    displayName.value = auth.user.display_name || auth.user.username || ''
  }
}

async function loadTokens() {
  try {
    const res = await userApi.getTokens()
    tokens.value = res.data?.data || res.data || []
  } catch { /* ignore */ }
}

async function saveProfile() {
  if (!displayName.value.trim()) {
    toast.error('显示名称不能为空')
    return
  }
  saving.value = true
  try {
    await authApi.getSelf() // Verify auth still valid
    // new-api uses PUT /api/user/self to update profile
    const api = (await import('axios')).default.create({ baseURL: '/api' })
    const token = localStorage.getItem('token') || ''
    await api.put('/user/self', {
      display_name: displayName.value.trim(),
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('保存成功')
    await auth.fetchUser()
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function createToken() {
  try {
    await userApi.createToken()
    await loadTokens()
    toast.success('令牌创建成功')
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '创建失败')
  }
}

function maskToken(t: string) {
  if (!t || t.length < 16) return t
  return t.slice(0, 8) + '...' + t.slice(-4)
}

async function copyToken(t: string) {
  try {
    await navigator.clipboard.writeText(t)
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败')
  }
}

async function deleteToken(id: number) {
  try {
    await userApi.deleteToken(id)
    await loadTokens()
    toast.success('令牌已删除')
  } catch (e: any) {
    toast.error(e?.response?.data?.message || '删除失败')
  }
}

async function handleTopup() {
  if (!topupCode.value.trim()) {
    toast.error('请输入充值码')
    return
  }
  topupLoading.value = true
  topupMsg.value = ''
  try {
    const res = await userApi.topUp(topupCode.value.trim())
    if (res.data?.success || res.status === 200) {
      topupMsg.value = '充值成功！'
      topupSuccess.value = true
      topupCode.value = ''
      await loadUser()
    } else {
      topupMsg.value = '充值码无效'
      topupSuccess.value = false
    }
  } catch (e: any) {
    topupMsg.value = e?.response?.data?.message || '充值失败'
    topupSuccess.value = false
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
