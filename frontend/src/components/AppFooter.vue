<template>
  <footer class="bg-gray-900 text-gray-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-white">ImageRelay</span>
          </div>
          <p class="text-sm leading-relaxed">基于 GPT Image 2 的 AI 图片创作平台，让创意变成现实。</p>
        </div>

        <!-- Product -->
        <div>
          <h4 class="text-white font-semibold text-sm mb-4">产品</h4>
          <ul class="space-y-2.5 text-sm">
            <li><RouterLink to="/console/create" class="hover:text-white transition-colors">文生图</RouterLink></li>
            <li><RouterLink to="/gallery" class="hover:text-white transition-colors">提示词画廊</RouterLink></li>
            <li><RouterLink to="/pricing" class="hover:text-white transition-colors">定价方案</RouterLink></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-white font-semibold text-sm mb-4">支持</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="https://github.com/xiaopengs/imagerelay" target="_blank" rel="noopener" class="hover:text-white transition-colors">GitHub</a></li>
            <li><a href="mailto:support@imagerelay.com" class="hover:text-white transition-colors">联系我们</a></li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="text-white font-semibold text-sm mb-4">法律</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">用户协议</a></li>
            <li><a href="#" class="hover:text-white transition-colors">隐私政策</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs">&copy; {{ new Date().getFullYear() }} ImageRelay. 保留所有权利。</p>
        <p class="text-xs">由 GPT Image 2 &middot; DALL-E 3 &middot; Imagen 3 提供动力</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
