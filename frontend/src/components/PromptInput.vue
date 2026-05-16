<template>
  <div class="prompt-input">
    <textarea
      v-model="localPrompt"
      :placeholder="placeholder || '描述你想要生成的图片...'"
      class="w-full bg-card-light border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-text-dim resize-none focus:border-primary focus:outline-none transition-colors"
      :rows="4"
      @input="$emit('update:modelValue', localPrompt)"
    />
    <div class="flex flex-wrap gap-2 mt-3">
      <button
        v-for="preset in presets"
        :key="preset"
        @click="localPrompt = preset; $emit('update:modelValue', preset)"
        class="text-xs px-3 py-1 rounded-full bg-card hover:bg-card-light border border-white/10 text-text-dim hover:text-text transition-all"
      >
        {{ preset }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ modelValue: string; placeholder?: string }>()
defineEmits(['update:modelValue'])
const localPrompt = ref(props.modelValue)
watch(() => props.modelValue, v => { localPrompt.value = v })
const presets = ['可爱猫咪', '赛博朋克城市', '山水风景', '动漫少女', '抽象艺术', '未来科技']
</script>