<template>
  <div class="style-selector space-y-4">
    <!-- 样式选择 -->
    <div>
      <label class="block text-sm text-text-dim mb-2">图片风格</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in styles"
          :key="s"
          @click="$emit('update:style', s)"
          class="text-xs px-3 py-1.5 rounded-full border transition-all"
          :class="modelValue === s
            ? 'bg-primary border-primary text-white'
            : 'bg-card border-white/10 text-text-dim hover:text-text hover:border-white/20'"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- 尺寸选择 -->
    <div>
      <label class="block text-sm text-text-dim mb-2">图片尺寸</label>
      <select
        :value="size"
        @change="$emit('update:size', ($event.target as HTMLSelectElement).value)"
        class="w-full bg-card-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm focus:border-primary focus:outline-none"
      >
        <option v-for="opt in sizes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <!-- 数量选择 -->
    <div>
      <label class="block text-sm text-text-dim mb-2">生成数量</label>
      <div class="flex gap-2">
        <button
          v-for="c in counts"
          :key="c"
          @click="$emit('update:count', c)"
          class="flex-1 text-xs px-3 py-1.5 rounded-full border transition-all"
          :class="count === c
            ? 'bg-primary border-primary text-white'
            : 'bg-card border-white/10 text-text-dim hover:text-text hover:border-white/20'"
        >
          {{ c }}张
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
  { label: '1:1 (1024×1024)', value: '1024x1024' },
  { label: '16:9 (1792×1024)', value: '1792x1024' },
  { label: '9:16 (1024×1792)', value: '1024x1792' }
]
const counts = [1, 2, 4]
</script>