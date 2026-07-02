import { ref, readonly } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function addToast(type: Toast['type'], message: string, duration = 4000) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    // Limit to 5 concurrent toasts, evict oldest
    if (toasts.value.length > 5) {
      toasts.value = toasts.value.slice(-5)
    }
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message: string) { addToast('success', message) }
  function error(message: string) { addToast('error', message, 6000) }
  function info(message: string) { addToast('info', message) }
  function dismiss(id: number) { toasts.value = toasts.value.filter(t => t.id !== id) }

  return { toasts: readonly(toasts), success, error, info, dismiss }
}
