<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-5xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-bold text-white mb-8">图生图</h1>

      <div class="space-y-6">
        <!-- 上传区 -->
        <div class="card p-6">
          <label class="block text-sm text-text-dim mb-3">上传参考图</label>
          <ImageUploader v-model:base64="inputImage" />
        </div>

        <!-- 参数区 -->
        <div class="card p-6 space-y-5">
          <div>
            <label class="block text-sm text-text-dim mb-3">图片描述（Prompt）</label>
            <PromptInput v-model="prompt" placeholder="描述你想要融合的风格或效果..." />
          </div>

          <div>
            <label class="block text-sm text-text-dim mb-3">风格</label>
            <StyleSelector v-model:style="style" v-model:size="size" v-model:count="count" />
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="flex items-center gap-4">
          <button
            @click="handleGenerate"
            :disabled="generating || !inputImage || !prompt.trim()"
            class="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {{ generating ? '生成中...' : '开始生成' }}
          </button>
          <p class="text-sm text-text-dim">消耗 {{ count }} 积分</p>
          <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
        </div>

        <!-- 结果 -->
        <ImagePreview v-if="results.length > 0" :images="results" :loading="generating" :cols="2" />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import PromptInput from '@/components/PromptInput.vue'
import StyleSelector from '@/components/StyleSelector.vue'
import ImagePreview from '@/components/ImagePreview.vue'

const prompt = ref('')
const style = ref('写实')
const size = ref('1024x1024')
const count = ref(1)
const inputImage = ref('')
const generating = ref(false)
const error = ref('')
const results = ref<Array<{ url: string }>>([])

async function handleGenerate() {
  generating.value = true
  error.value = ''
  results.value = []
  try {
    const token = localStorage.getItem('token') || ''
    const body: Record<string, unknown> = {
      model: 'dall-e-3',
      prompt: prompt.value,
      n: count.value,
      size: size.value
    }
    if (inputImage.value) body.input_image = inputImage.value

    const res = await fetch('/api/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      error.value = err.message || '生成失败'
      return
    }
    const data = await res.json()
    results.value = data.data || []
  } catch (e: any) {
    error.value = e?.message || '网络错误，请重试'
  } finally {
    generating.value = false
  }
}
</script>