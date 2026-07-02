<template>
  <div class="space-y-4">
    <!-- Style -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">风格</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in styles"
          :key="s"
          @click="$emit('update:style', s)"
          class="chip"
          :class="{ 'chip-active': modelValue === s }"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Size -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in sizes"
          :key="opt.value"
          @click="$emit('update:size', opt.value)"
          class="chip"
          :class="{ 'chip-active': size === opt.value }"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Count -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">数量</label>
      <div class="flex gap-2">
        <button
          v-for="c in counts"
          :key="c"
          @click="$emit('update:count', c)"
          class="chip flex-1 text-center"
          :class="{ 'chip-active': count === c }"
        >
          {{ c }} 张
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; size: string; count: number }>()
defineEmits(['update:modelValue', 'update:style', 'update:size', 'update:count'])
const styles = ['写实', '动漫', '插画', '油画', '水彩', '极简', '摄影']
const sizes = [
  { label: '1:1 (1024x1024)', value: '1024x1024' },
  { label: '16:9 (1792x1024)', value: '1792x1024' },
  { label: '9:16 (1024x1792)', value: '1024x1792' }
]
const counts = [1, 2, 4]
</script>
