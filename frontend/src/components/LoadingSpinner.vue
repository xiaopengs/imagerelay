<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClass = computed(() => ({
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4'
}[props.size]))
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      :class="sizeClass"
      class="border-primary-200 border-t-primary-500 rounded-full animate-spin"
    />
  </div>
</template>
