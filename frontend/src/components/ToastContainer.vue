<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
          :class="toastClass(t.type)"
          @click="dismiss(t.id)"
        >
          <span v-if="t.type === 'success'" class="text-base">&#10003;</span>
          <span v-else-if="t.type === 'error'" class="text-base">&#10007;</span>
          <span v-else class="text-base">&#8505;</span>
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/utils/toast'

const { toasts, dismiss } = useToast()

function toastClass(type: string) {
  return {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-primary-500/90 text-white',
  }[type] || 'bg-gray-700/90 text-white'
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
