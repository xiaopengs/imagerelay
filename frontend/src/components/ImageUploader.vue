<template>
  <div class="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
    :class="{ 'border-primary': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
    @click="triggerInput"
  >
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
    <div v-if="!previewUrl">
      <div class="text-4xl mb-3">📤</div>
      <p class="text-text-dim">拖拽图片到这里，或点击上传</p>
      <p class="text-text-dim text-xs mt-1">支持 PNG, JPG, WEBP，最大 10MB</p>
    </div>
    <div v-else class="relative">
      <img :src="previewUrl" class="max-h-64 mx-auto rounded-lg" />
      <button @click.stop="clear" class="absolute top-2 right-2 bg-error text-white w-6 h-6 rounded-full text-xs">✕</button>
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