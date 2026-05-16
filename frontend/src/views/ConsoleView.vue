<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { imagesApi } from '@/api/images'

const router = useRouter()
const auth = useAuthStore()

const balance = ref(0)
const loading = ref(false)

interface HistoryItem {
  id: number
  prompt: string
  type: string
  imageUrl: string
  createdAt: string
}

const recentHistory = ref<HistoryItem[]>([])

async function refreshBalance() {
  try {
    const res = await fetch('/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      balance.value = data.balance ?? 0
    }
  } catch {
    // silently fail
  }
}

async function loadRecentHistory() {
  try {
    const res = await fetch('/api/v1/images/history?limit=3', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      recentHistory.value = (data.data || []).map((item: Record<string, unknown>) => ({
        id: item.id as number,
        prompt: item.prompt as string || '',
        type: item.type as string || 'text2image',
        imageUrl: item.image_url as string || '',
        createdAt: item.created_at as string || ''
      }))
    }
  } catch {
    // silently fail
  }
}

onMounted(() => {
  refreshBalance()
  loadRecentHistory()
})

function goText2Image() {
  router.push('/console/text2image')
}

function goImage2Image() {
  router.push('/console/image2image')
}

function goHistory() {
  router.push('/console/history')
}

function goSettings() {
  router.push('/console/settings')
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    <!-- 欢迎语 + 积分卡片 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">
          你好，{{ auth.userInfo?.display_name || auth.userInfo?.email?.split('@')[0] || '用户' }} 👋
        </h1>
        <p class="text-gray-400 mt-1 text-sm">欢迎回来，开始你的创作吧</p>
      </div>
      <div
        class="bg-card rounded-2xl px-6 py-4 flex items-center gap-4 border border-[#7c6af5]/20 min-w-[200px]"
      >
        <div class="w-10 h-10 rounded-xl bg-[#7c6af5]/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-400">积分余额</p>
          <p class="text-xl font-bold text-white">{{ balance.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- 快捷入口：文生图 / 图生图 -->
    <div class="grid grid-cols-2 gap-6">
      <button
        @click="goText2Image"
        class="bg-card rounded-2xl p-8 border border-[#7c6af5]/20 hover:border-[#7c6af5]/50 transition-all group cursor-pointer text-left"
      >
        <div class="w-14 h-14 rounded-2xl bg-[#7c6af5]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">文生图</h3>
        <p class="text-sm text-gray-400">输入描述词，让 AI 生成你想要的作品</p>
      </button>

      <button
        @click="goImage2Image"
        class="bg-card rounded-2xl p-8 border border-[#7c6af5]/20 hover:border-[#7c6af5]/50 transition-all group cursor-pointer text-left"
      >
        <div class="w-14 h-14 rounded-2xl bg-[#7c6af5]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">图生图</h3>
        <p class="text-sm text-gray-400">上传参考图，AI 融合风格再创作</p>
      </button>
    </div>

    <!-- 最近生图记录 -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-white">最近生图记录</h2>
        <button
          v-if="recentHistory.length > 0"
          @click="goHistory"
          class="text-xs text-primary hover:underline"
        >
          查看全部 →
        </button>
      </div>

      <div v-if="recentHistory.length === 0" class="text-center py-12 text-gray-500">
        <div class="text-4xl mb-3">🎨</div>
        <p>还没有生图记录</p>
        <button @click="goText2Image" class="mt-4 text-sm text-primary hover:underline">开始创作 →</button>
      </div>

      <div v-else class="grid grid-cols-3 gap-4">
        <div
          v-for="item in recentHistory"
          :key="item.id"
          class="bg-card rounded-xl overflow-hidden border border-[#7c6af5]/10 hover:border-[#7c6af5]/30 transition-all"
        >
          <div class="aspect-square bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              class="w-full h-full object-cover"
              alt="生成图片"
            />
            <span v-else class="text-gray-600">无图片</span>
          </div>
          <div class="p-3">
            <p class="text-xs text-gray-400 truncate mb-1">{{ item.prompt || '无描述' }}</p>
            <div class="flex items-center justify-between">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#7c6af5]/10 text-primary">
                {{ item.type === 'image2image' ? '图生图' : '文生图' }}
              </span>
              <span class="text-[10px] text-gray-600">{{ formatTime(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷链接 -->
    <div class="flex gap-4 pt-2">
      <button
        @click="goSettings"
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-card"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        充值积分
      </button>
      <a
        href="/docs"
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-card"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        API 文档
      </a>
    </div>
  </div>
</template>