<script setup lang="ts">
</script>

<template>
  <footer class="border-t border-[#1e1e30] bg-[#0a0a0f]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <!-- Top: Links + Brand -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

        <!-- Brand Column -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-2 text-xl font-bold text-[#e0e0e0] mb-3">
            <span>ImageRelay</span>
            <span class="text-2xl">🐾</span>
          </div>
          <p class="text-sm text-[#606080] max-w-xs leading-relaxed">
            基于先进 AI 模型的图像生成平台，将你的创意变为现实。
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="text-sm font-semibold text-[#e0e0e0] mb-3">产品</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-sm text-[#606080] hover:text-[#7c6af5] transition-colors">
                首页
              </router-link>
            </li>
            <li>
              <router-link to="/pricing" class="text-sm text-[#606080] hover:text-[#7c6af5] transition-colors">
                定价
              </router-link>
            </li>
            <li>
              <router-link to="/docs" class="text-sm text-[#606080] hover:text-[#7c6af5] transition-colors">
                API 文档
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-[#e0e0e0] mb-3">公司</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-sm text-[#606080] hover:text-[#7c6af5] transition-colors">
                关于我们
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-[#606080] hover:text-[#7c6af5] transition-colors">
                服务条款
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-[#606080] hover:text-[#7c6af5] transition-colors">
                隐私政策
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-[#1e1e30] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

        <!-- Copyright -->
        <p class="text-xs text-[#404060]">
          &copy; {{ new Date().getFullYear() }} ImageRelay. 保留所有权利。
        </p>

        <!-- ICP -->
        <p class="text-xs text-[#404060]">
          京ICP备XXXXXXXX号-1
        </p>
      </div>
    </div>
  </footer>
</template>