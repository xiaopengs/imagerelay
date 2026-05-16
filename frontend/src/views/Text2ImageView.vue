<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-5xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-bold text-white mb-8">文生图</h1>

      <div class="flex gap-8">
        <!-- 左侧参数面板 -->
        <div class="w-80 flex-shrink-0 space-y-6">
          <div class="card p-6 space-y-5">
            <div>
              <label class="block text-sm text-text-dim mb-3">描述你的图片</label>
              <PromptInput v-model="prompt" />
            </div>

            <div>
              <label class="block text-sm text-text-dim mb-3">风格</label>
              <StyleSelector v-model:style="style" v-model:size="size" v-model:count="count" />
            </div>
          </div>

          <div class="card p-6">
            <p class="text-xs text-text-dim mb-2">消耗积分</p>
            <p class="text-2xl font-bold text-white mb-1">{{ count }} 积分</p>
            <p class="text-xs text-text-dim">当前余额：{{ balance.toLocaleString() }} 积分</p>
            <button
              @click="handleGenerate"
              :disabled="generating || !prompt.trim() || balance < count"
              class="btn-primary w-full mt-4 disabled:opacity-50"
            >
              {{ generating ? '生成中...' : '开始生成' }}
            </button>
            <p v-if="error" class="text-xs text-red-400 mt-2">{{ error }}</p>
          </div>
        </div>

        <!-- 右侧预览 -->
        <div class="flex-1">
          <div v-if="results.length === 0" class="card p-16 flex flex-col items-center justify-center text-center">
            <div class="text-5xl mb-4 opacity-30">🎨</div>
            <p class="text-text-dim">输入描述词，开始创作</p>
          </div>
          <ImagePreview v-else :images="results" :loading="generating" :cols="results.length > 1 ? 2 : 1" />
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
import PromptInput from '@/components/PromptInput.vue'
import StyleSelector from '@/components/StyleSelector.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { imagesApi } from '@/api/images'

const prompt = ref('')
const style = ref('写实')
const size = ref('1024x1024')
const count = ref(1)
const balance = ref(0)
const generating = ref(false)
const error = ref('')
const results = ref<Array<{ url: string }>>([])

async function refreshBalance() {
  try {
    const token = localStorage.getItem('token') || ''
    const res = await fetch('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      balance.value = data.remain_quota ?? 0
    }
  } catch {}
}

async function handleGenerate() {
  generating.value = true
  error.value = ''
  results.value = []
  try {
    const token = localStorage.getItem('token') || ''
    const res = await fetch('/api/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt.value,
        n: count.value,
        size: size.value
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '生成失败' }))
      error.value = err.message || '生成失败'
      return
    }
    const data = await res.json()
    results.value = data.data || []
    await refreshBalance()
  } catch (e: any) {
    error.value = e?.message || '网络错误，请重试'
  } finally {
    generating.value = false
  }
}

onMounted(refreshBalance)
</script>