<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-5xl mx-auto px-6 py-12">
      <!-- Hero -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-white mb-6 leading-tight">
          AI 生图<br />
          <span class="text-primary">一触即达</span>
        </h1>
        <p class="text-lg text-text-dim mb-10 max-w-xl mx-auto">
          基于 GPT Image 2 与 Gemini Imagen 模型，一键生成专业级图片。支持文生图、图生图，满足电商、设计、内容创作全场景需求。
        </p>
        <div class="flex gap-4 justify-center">
          <RouterLink to="/register" class="btn-primary px-8 py-3 text-base">
            立即开始 →
          </RouterLink>
          <RouterLink to="/pricing" class="btn-secondary px-8 py-3 text-base">
            查看定价
          </RouterLink>
        </div>
      </div>

      <!-- 功能卡片 -->
      <div class="grid grid-cols-3 gap-6 mb-16">
        <div class="card p-8 text-center">
          <div class="text-4xl mb-4">🎨</div>
          <h3 class="text-lg font-bold text-white mb-2">文生图</h3>
          <p class="text-sm text-text-dim">输入描述词，AI 在几秒内生成专业图片，精准匹配你的创意</p>
        </div>
        <div class="card p-8 text-center">
          <div class="text-4xl mb-4">🖼️</div>
          <h3 class="text-lg font-bold text-white mb-2">图生图</h3>
          <p class="text-sm text-text-dim">上传参考图，AI 融合已有风格再创作，激发无限灵感</p>
        </div>
        <div class="card p-8 text-center">
          <div class="text-4xl mb-4">⚡</div>
          <h3 class="text-lg font-bold text-white mb-2">API 接入</h3>
          <p class="text-sm text-text-dim">开放 OpenAI 兼容 API，开发者可轻松接入自有产品</p>
        </div>
      </div>

      <!-- 演示区 -->
      <div class="card p-10 mb-16">
        <p class="text-center text-sm text-text-dim mb-6">效果示例</p>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="aspect-square rounded-xl flex items-center justify-center text-white text-7xl font-bold"
            :style="`background: linear-gradient(135deg, hsl(${(i * 60)}, 70%, 25%), hsl(${(i * 60)}, 70%, 40%))`"
          >
            {{ ['', '🎨', '🌌', '🐱', '⚡'][i] }}
          </div>
        </div>
        <p class="text-center text-xs text-text-dim mt-4">由 GPT Image 2 生成 · 可商用</p>
      </div>

      <!-- 定价入口 -->
      <div class="text-center">
        <p class="text-text-dim mb-3">简单透明的定价</p>
        <RouterLink to="/pricing" class="btn-primary px-8 py-3">
          查看定价方案 →
        </RouterLink>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>