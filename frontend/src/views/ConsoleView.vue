<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Card -->
    <div class="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-2xl p-6 lg:p-8 mb-8">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            欢迎回来，{{ auth.user?.display_name || auth.user?.username || '创作者' }}
          </h1>
          <p class="text-gray-500 text-sm mt-1">开始你的 AI 图片创作之旅</p>
        </div>
        <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-primary-100 flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-400">积分余额</p>
            <p class="text-lg font-bold text-gray-800">{{ formatBalance(auth.balance) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <RouterLink to="/console/create" class="card-hover p-5 flex items-center gap-4">
        <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">创建图片</h3>
          <p class="text-xs text-gray-400">文生图 / 图生图</p>
        </div>
      </RouterLink>

      <RouterLink to="/gallery" class="card-hover p-5 flex items-center gap-4">
        <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">浏览画廊</h3>
          <p class="text-xs text-gray-400">11,600+ 精选提示词</p>
        </div>
      </RouterLink>

      <RouterLink to="/console/billing" class="card-hover p-5 flex items-center gap-4">
        <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">充值中心</h3>
          <p class="text-xs text-gray-400">4 档套餐，最低 &yen;0.20/张</p>
        </div>
      </RouterLink>
    </div>

    <!-- Recent Generations Placeholder -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">最近生成</h2>
        <RouterLink to="/console/create" class="text-sm text-primary-600 hover:text-primary-700">开始创作 &rarr;</RouterLink>
      </div>
      <div class="card p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <p class="text-gray-500">还没有生成记录</p>
        <RouterLink to="/console/create" class="btn-primary inline-block mt-4 text-sm">开始创作</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

function formatBalance(q: number) {
  return (q / 500000).toFixed(1) + ' 积分'
}
</script>
