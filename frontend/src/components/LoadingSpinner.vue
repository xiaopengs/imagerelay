<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClass = computed(() => ({
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}[props.size]))
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      :class="sizeClass"
      class="border-[3px] border-[#7c6af5]/20 border-t-[#7c6af5] rounded-full animate-spin"
    />
  </div>
</template>