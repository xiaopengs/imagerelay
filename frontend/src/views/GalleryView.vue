<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header -->
    <div class="text-center mb-10">
      <span class="section-tag">画廊</span>
      <h1 class="text-3xl font-bold text-gray-800 mt-4">提示词画廊</h1>
      <p class="text-gray-500 mt-2">精选提示词，激发你的创作灵感，点击即可一键生成</p>
    </div>

    <!-- Search + Category Filter -->
    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          class="input-field !pl-10"
          placeholder="搜索提示词..."
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="selectedCategory = selectedCategory === cat.value ? '' : cat.value"
          class="chip whitespace-nowrap"
          :class="{ 'chip-active': selectedCategory === cat.value }"
        >{{ cat.label }}</button>
      </div>
    </div>

    <!-- Results Count -->
    <p class="text-sm text-gray-400 mb-4">共 {{ filteredPrompts.length }} 条提示词</p>

    <!-- Empty State -->
    <div v-if="filteredPrompts.length === 0" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <p class="text-gray-500">没有找到匹配的提示词</p>
      <button @click="searchQuery = ''; selectedCategory = ''" class="text-sm text-primary-600 hover:underline mt-2">清除筛选</button>
    </div>

    <!-- Card Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="prompt in filteredPrompts"
        :key="prompt.id"
        class="card-hover overflow-hidden cursor-pointer group"
        @click="handleCardClick(prompt)"
      >
        <!-- Gradient Preview Area -->
        <div
          class="aspect-[4/3] flex items-center justify-center text-5xl relative overflow-hidden"
          :style="`background: linear-gradient(135deg, ${getGradient(prompt.id)})`"
        >
          <span class="opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
            {{ getEmoji(prompt) }}
          </span>
          <!-- Style Badge -->
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 font-medium">
              {{ getStyleBadge(prompt) }}
            </span>
          </div>
        </div>
        <!-- Info -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-sm font-semibold text-gray-800">{{ prompt.title }}</h3>
            <span class="text-xs text-gray-400">{{ prompt.titleEn }}</span>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 mb-3">{{ prompt.description }}</p>
          <div class="flex items-center gap-2">
            <span
              v-for="tag in prompt.categories.useCases.slice(0, 2)"
              :key="tag"
              class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
            >{{ categoryLabel(tag) }}</span>
            <span v-if="prompt.arguments.length > 0" class="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">
              可自定义
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Argument Dialog -->
    <Teleport to="body">
      <div
        v-if="dialogPrompt"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="dialogPrompt = null"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ dialogPrompt.title }}</h3>
          <p class="text-sm text-gray-500 mb-5">{{ dialogPrompt.description }}</p>

          <div class="space-y-4 mb-6">
            <div v-for="arg in dialogPrompt.arguments" :key="arg.name">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ arg.label }}</label>
              <input
                v-model="dialogValues[arg.name]"
                :placeholder="arg.default"
                class="input-field"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="dialogPrompt = null" class="btn-ghost flex-1">取消</button>
            <button @click="goToCreate" class="btn-primary flex-1">去生成</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { galleryApi, type PromptItem } from '@/api/gallery'
import { getGradient, getEmoji, replaceArguments } from '@/utils/promptHelpers'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('')
const dialogPrompt = ref<PromptItem | null>(null)
const dialogValues = ref<Record<string, string>>({})

const categories = [
  { label: '头像', value: 'profile-avatar' },
  { label: '社交媒体', value: 'social-media' },
  { label: '电商', value: 'ecommerce' },
  { label: '信息图', value: 'infographic' },
  { label: '游戏', value: 'game' },
  { label: '漫画', value: 'comic' },
]

const categoryLabels: Record<string, string> = {
  'profile-avatar': '头像',
  'social-media': '社交',
  'ecommerce': '电商',
  'infographic': '信息图',
  'game': '游戏',
  'comic': '漫画',
  'thumbnail': '缩略图',
}

function categoryLabel(tag: string) {
  return categoryLabels[tag] || tag
}

const filteredPrompts = computed(() => {
  let result = galleryApi.getAll()
  if (searchQuery.value.trim()) {
    result = galleryApi.search(searchQuery.value.trim())
  }
  if (selectedCategory.value) {
    result = result.filter(p =>
      p.categories.useCases.includes(selectedCategory.value) ||
      p.categories.styles.includes(selectedCategory.value) ||
      p.categories.subjects.includes(selectedCategory.value)
    )
  }
  return result
})

function getStyleBadge(prompt: PromptItem) {
  const styleLabels: Record<string, string> = {
    photography: '摄影', anime: '动漫', illustration: '插画',
    'oil-painting': '油画', watercolor: '水彩', minimalist: '极简', realistic: '写实',
  }
  return styleLabels[prompt.categories.styles[0]] || prompt.categories.styles[0]
}

function handleCardClick(prompt: PromptItem) {
  if (prompt.arguments.length > 0) {
    dialogPrompt.value = prompt
    const vals: Record<string, string> = {}
    prompt.arguments.forEach(a => { vals[a.name] = a.default })
    dialogValues.value = vals
  } else {
    router.push({ name: 'create', query: { prompt: prompt.content } })
  }
}

function goToCreate() {
  if (!dialogPrompt.value) return
  const finalContent = replaceArguments(dialogPrompt.value.content, dialogValues.value)
  dialogPrompt.value = null
  router.push({ name: 'create', query: { prompt: finalContent } })
}
</script>
