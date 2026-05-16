<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-5xl mx-auto px-6 py-12">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-white">生图历史</h1>
        <div class="flex gap-2">
          <button
            v-for="f in filters"
            :key="f.value"
            @click="activeFilter = f.value; loadHistory()"
            class="px-4 py-1.5 rounded-full text-sm transition-colors"
            :class="activeFilter === f.value ? 'bg-primary text-white' : 'bg-card text-text-dim hover:text-white'"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="history.length === 0" class="card p-16 text-center">
        <div class="text-5xl mb-4">🎨</div>
        <p class="text-text-dim mb-4">还没有生图记录</p>
        <RouterLink to="/console/text2image" class="btn-primary px-6 py-2">开始创作 →</RouterLink>
      </div>

      <div v-else class="grid grid-cols-3 gap-4">
        <div
          v-for="item in history"
          :key="item.id"
          class="card overflow-hidden hover:border-primary/30 transition-all"
        >
          <div class="aspect-square bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
            <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover" :alt="item.prompt" />
            <span v-else class="text-gray-600">无图片</span>
          </div>
          <div class="p-3">
            <p class="text-xs text-text-dim truncate mb-2">{{ item.prompt || '无描述' }}</p>
            <div class="flex items-center justify-between">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {{ item.type === 'image2image' ? '图生图' : '文生图' }}
              </span>
              <span class="text-[10px] text-gray-600">{{ formatTime(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="currentPage = p; loadHistory()"
          class="w-8 h-8 rounded-lg text-sm"
          :class="currentPage === p ? 'bg-primary text-white' : 'bg-card text-text-dim hover:text-white'"
        >{{ p }}</button>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const activeFilter = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)

interface HistoryItem {
  id: number; prompt: string; type: string; imageUrl: string; createdAt: string
}

const history = ref<HistoryItem[]>([])
const filters = [
  { label: '全部', value: 'all' },
  { label: '文生图', value: 'text2image' },
  { label: '图生图', value: 'image2image' }
]

async function loadHistory() {
  loading.value = true
  try {
    const token = localStorage.getItem('token') || ''
    const params = new URLSearchParams({ page: String(currentPage.value), limit: '12' })
    if (activeFilter.value !== 'all') params.set('type', activeFilter.value)
    const res = await fetch(`/api/v1/images/history?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      history.value = (data.data || []).map((item: Record<string, unknown>) => ({
        id: item.id as number,
        prompt: item.prompt as string || '',
        type: item.type as string || 'text2image',
        imageUrl: item.image_url as string || '',
        createdAt: item.created_at as string || ''
      }))
      totalPages.value = data.total_pages || 1
    }
  } finally {
    loading.value = false
  }
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

onMounted(loadHistory)
</script>