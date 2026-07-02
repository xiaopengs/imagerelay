<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
    :class="isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
    @click="triggerInput"
  >
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
    <div v-if="!previewUrl">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-gray-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p class="text-sm text-gray-500">拖拽图片到这里，或点击上传</p>
      <p class="text-xs text-gray-400 mt-1">支持 PNG, JPG, WEBP，最大 10MB</p>
    </div>
    <div v-else class="relative">
      <img :src="previewUrl" class="max-h-64 mx-auto rounded-lg" />
      <button @click.stop="clear" class="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ (e: 'update:base64', v: string): void }>()

const isDragging = ref(false)
const previewUrl = ref('')
const fileInput = ref<HTMLInputElement>()

function triggerInput() {
  fileInput.value?.click()
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFile(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}

function readFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    const base64 = (e.target?.result as string).split(',')[1]
    emit('update:base64', base64)
  }
  reader.readAsDataURL(file)
}

function clear() {
  previewUrl.value = ''
  emit('update:base64', '')
  if (fileInput.value) fileInput.value.value = ''
}
</script>
