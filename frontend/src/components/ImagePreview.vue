<template>
  <div class="grid gap-3" :class="gridClass">
    <div
      v-for="(img, i) in images"
      :key="i"
      class="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <img
        :src="img.url"
        :alt="`Generated image ${i + 1}`"
        class="w-full aspect-square object-cover cursor-pointer"
        loading="lazy"
        @click="openLightbox(i)"
        @error="failedImages.add(i)"
      />
      <!-- Error fallback -->
      <div v-if="failedImages.has(i)" class="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
        <span class="text-xs">加载失败</span>
      </div>
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-center gap-3 pb-4 opacity-0 group-hover:opacity-100">
        <button @click.stop="download(img.url)" class="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all" title="下载">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button @click.stop="$emit('favorite', img)" class="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all" title="收藏">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button @click.stop="$emit('variation', img)" class="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all" title="变体">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-for="j in loadingSlots"
      :key="'sk-' + j"
      class="rounded-xl border border-gray-200 bg-gray-100 aspect-square animate-pulse flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-2 text-gray-400">
        <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs">生成中...</span>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
        @click.self="lightboxOpen = false"
      >
        <img :src="images[lightboxIndex]?.url" class="max-w-full max-h-full rounded-xl shadow-2xl" />
        <button
          @click="lightboxOpen = false"
          class="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-xl transition-all"
        >
          ✕
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  images: Array<{ url: string }>
  loading: boolean
  cols?: 1 | 2
}>(), {
  cols: 2,
})

defineEmits<{
  (e: 'favorite', img: { url: string }): void
  (e: 'variation', img: { url: string }): void
}>()

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const failedImages = reactive(new Set<number>())

const gridClass = computed(() => props.cols === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')

const loadingSlots = computed(() => {
  if (!props.loading) return 0
  const target = props.cols === 1 ? 1 : 2
  return Math.max(0, target - props.images.length)
})

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && lightboxOpen.value) {
    lightboxOpen.value = false
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

// Close lightbox if images array changes (e.g., new batch replaces old images)
watch(() => props.images, () => {
  if (lightboxOpen.value) lightboxOpen.value = false
})

async function download(url: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `imagerelay-${Date.now()}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  } catch {
    window.open(url, '_blank')
  }
}
</script>
