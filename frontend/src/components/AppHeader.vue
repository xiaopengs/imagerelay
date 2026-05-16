<template>
  <header class="bg-card border-b border-white/5 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink to="/" class="text-lg font-bold text-primary tracking-wide">ImageRelay</RouterLink>
      <nav class="flex items-center gap-4 text-sm">
        <RouterLink to="/pricing" class="text-text-dim hover:text-text transition-colors">定价</RouterLink>
        <RouterLink to="/docs" class="text-text-dim hover:text-text transition-colors">文档</RouterLink>
        <template v-if="auth.token">
          <RouterLink to="/console" class="text-primary hover:text-primary-light transition-colors">控制台</RouterLink>
          <button @click="auth.logout()" class="text-text-dim hover:text-text transition-colors">退出</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="text-text-dim hover:text-text transition-colors">登录</RouterLink>
          <RouterLink to="/register" class="bg-primary hover:bg-primary-light text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">注册</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>