<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface HistoryItem {
  id: number
  prompt: string
  type: string
  imageUrl: string
  createdAt: string
}

const items = ref<HistoryItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const PAGE_SIZE = 12

async function loadHistory(page = 1) {
  loading.value = true
  try {
    const token = localStorage.getItem('token') || ''
    const res = await fetch(`/api/v1/images/history?page=${page}&page_size=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      const list = data.data || []
      totalPages.value = Math.max(1, Math.ceil((data.total || list.length) / PAGE_SIZE))
      items.value = list.map((item: Record<string, unknown>) => ({
        id: item.id as number,
        prompt: item.prompt as string || '',
        type: item.type as string || 'text2image',
        imageUrl: item.image_url as string || (item.url as string) || '',
        createdAt: item.created_at as string || ''
      }))
    }
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadHistory())

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  loadHistory(p)
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getFullYear()}`
}
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold text-white mb-6">生图历史</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-gray-500">
      <div class="animate-pulse text-lg">加载中...</div>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="text-center py-24">
      <div class="text-6xl mb-6">🎨</div>
      <h2 class="text-xl font-bold text-white mb-3">还没有生图记录</h2>
      <p class="text-gray-400 text-sm mb-8">开始创作你的第一张图片吧</p>
      <router-link
        to="/console/text2image"
        class="inline-block px-6 py-3 bg-[#7c6af5] hover:bg-[#6b59e8] text-white rounded-xl font-medium text-sm transition-colors"
      >
        开始创作
      </router-link>
    </div>

    <!-- Grid -->
    <div v-else>
      <div class="grid grid-cols-3 gap-5">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-card rounded-2xl overflow-hidden border border-[#7c6af5]/10 hover:border-[#7c6af5]/30 transition-all group"
        >
          <div class="aspect-square bg-[#0a0a0f] overflow-hidden">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="生成图片"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
              🖼
            </div>
          </div>
          <div class="p-4">
            <p class="text-sm text-gray-300 line-clamp-2 mb-3 min-h-[40px]">
              {{ item.prompt || '无描述' }}
            </p>
            <div class="flex items-center justify-between">
              <span
                class="text-[11px] px-2.5 py-0.5 rounded-full"
                :class="item.type === 'image2image'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-[#7c6af5]/10 text-primary'"
              >
                {{ item.type === 'image2image' ? '图生图' : '文生图' }}
              </span>
              <span class="text-xs text-gray-600">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
        <button
          @click="goPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-xl bg-[#141420] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
        >
          上一页
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          @click="goPage(p)"
          class="w-9 h-9 rounded-xl text-sm transition-colors"
          :class="p === currentPage
            ? 'bg-[#7c6af5] text-white'
            : 'bg-[#141420] text-gray-400 hover:text-white'"
        >
          {{ p }}
        </button>
        <button
          @click="goPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-xl bg-[#141420] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>