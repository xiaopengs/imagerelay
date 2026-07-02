<template>
  <div>
    <textarea
      v-model="localPrompt"
      :placeholder="placeholder || '描述你想要生成图片...'"
      class="input-field min-h-[100px] resize-y !text-sm"
      rows="4"
      @input="$emit('update:modelValue', localPrompt)"
    />
    <div class="flex flex-wrap gap-2 mt-3">
      <button
        v-for="preset in presets"
        :key="preset"
        @click="localPrompt = preset; $emit('update:modelValue', preset)"
        class="chip"
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
