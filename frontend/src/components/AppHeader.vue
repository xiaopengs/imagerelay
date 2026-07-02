<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">ImageRelay</span>
        </RouterLink>

        <!-- Nav Links -->
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Auth Actions -->
        <div class="flex items-center gap-3">
          <template v-if="auth.isLoggedIn">
            <RouterLink
              to="/console"
              class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              控制台
            </RouterLink>
            <div class="relative" ref="menuRef">
              <button
                @click="showMenu = !showMenu"
                class="w-9 h-9 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center transition-colors"
              >
                <span class="text-sm font-semibold text-primary-600">{{ avatarLetter }}</span>
              </button>
              <Transition name="dropdown">
                <div
                  v-if="showMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 overflow-hidden"
                >
                  <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-700 truncate">{{ auth.user?.display_name || auth.user?.username || '用户' }}</p>
                    <p class="text-xs text-gray-400">余额: {{ formatBalance(auth.balance) }}</p>
                  </div>
                  <RouterLink to="/console/create" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50" @click="showMenu = false">创建图片</RouterLink>
                  <RouterLink to="/console/billing" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50" @click="showMenu = false">充值中心</RouterLink>
                  <RouterLink to="/console/settings" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50" @click="showMenu = false">设置</RouterLink>
                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >退出登录</button>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >登录</RouterLink>
            <RouterLink
              to="/register"
              class="btn-primary !py-2 !px-4 text-sm"
            >免费注册</RouterLink>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile Nav -->
    <div class="md:hidden border-t border-gray-100 bg-white/90 backdrop-blur-lg">
      <div class="flex items-center justify-around py-2">
        <RouterLink
          v-for="link in mobileLinks"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors"
        >
          <component :is="link.icon" />
          {{ link.label }}
        </RouterLink>
      </div>
    </div>
  </header>

  <!-- Spacer for fixed header -->
  <div class="h-16 md:h-16"></div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const avatarLetter = computed(() => {
  const name = auth.user?.display_name || auth.user?.username || ''
  return name.charAt(0).toUpperCase() || 'U'
})

function formatBalance(q: number) {
  return (q / 500000).toFixed(1) + ' 积分'
}

function handleLogout() {
  showMenu.value = false
  auth.logout()
  router.push('/')
}

const navLinks = [
  { to: '/gallery', label: '画廊' },
  { to: '/pricing', label: '定价' },
]

// Simple inline SVG icon components for mobile nav
const HomeIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' }),
])

const GalleryIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
  h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
  h('polyline', { points: '21 15 16 10 5 21' }),
])

const CreateIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('line', { x1: '12', y1: '8', x2: '12', y2: '16' }),
  h('line', { x1: '8', y1: '12', x2: '16', y2: '12' }),
])

const PricingIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('line', { x1: '12', y1: '1', x2: '12', y2: '23' }),
  h('path', { d: 'M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' }),
])

const mobileLinks = [
  { to: '/', label: '首页', icon: HomeIcon },
  { to: '/gallery', label: '画廊', icon: GalleryIcon },
  { to: '/console/create', label: '创作', icon: CreateIcon },
  { to: '/pricing', label: '定价', icon: PricingIcon },
]
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
