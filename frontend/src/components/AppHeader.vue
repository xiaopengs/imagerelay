<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCreditsStore } from '../stores/credits'

const auth = useAuthStore()
const credits = useCreditsStore()
const router = useRouter()
const route = useRoute()

const menuOpen = ref(false)
const userMenuOpen = ref(false)

async function ensureUserInfo() {
  if (auth.isLoggedIn && !auth.userInfo) {
    await auth.fetchUserInfo()
    await credits.fetchBalance()
  }
}

onMounted(() => {
  ensureUserInfo()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function closeUserMenu() {
  userMenuOpen.value = false
}

async function handleLogout() {
  auth.logout()
  userMenuOpen.value = false
  router.push('/')
}

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e30] bg-[#0a0a0f]/95 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-[#e0e0e0] hover:text-[#7c6af5] transition-colors">
        <span>ImageRelay</span>
        <span class="text-2xl">🐾</span>
      </router-link>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6">
        <router-link
          to="/"
          class="text-sm font-medium transition-colors"
          :class="isActive('/') ? 'text-[#7c6af5]' : 'text-[#a0a0b0] hover:text-[#e0e0e0]'"
        >
          首页
        </router-link>
        <router-link
          to="/pricing"
          class="text-sm font-medium transition-colors"
          :class="isActive('/pricing') ? 'text-[#7c6af5]' : 'text-[#a0a0b0] hover:text-[#e0e0e0]'"
        >
          定价
        </router-link>
        <router-link
          to="/docs"
          class="text-sm font-medium transition-colors"
          :class="isActive('/docs') ? 'text-[#7c6af5]' : 'text-[#a0a0b0] hover:text-[#e0e0e0]'"
        >
          文档
        </router-link>
      </nav>

      <!-- Desktop Auth -->
      <div class="hidden md:flex items-center gap-3">
        <!-- Logged In -->
        <template v-if="auth.isLoggedIn">
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141420] border border-[#1e1e30] text-sm text-[#e0e0e0] hover:border-[#7c6af5] transition-colors"
            >
              <span class="relative flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-[#7c6af5]/20 flex items-center justify-center text-xs text-[#7c6af5] font-semibold">
                  {{ auth.userInfo?.email?.charAt(0).toUpperCase() || 'U' }}
                </span>
                <span class="hidden sm:inline max-w-[120px] truncate">{{ auth.userInfo?.email || '用户' }}</span>
              </span>
              <svg class="w-4 h-4 text-[#a0a0b0]" :class="{ 'rotate-180': userMenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 rounded-xl bg-[#141420] border border-[#1e1e30] shadow-xl overflow-hidden"
              v-click-outside="closeUserMenu"
            >
              <div class="px-3 py-2 border-b border-[#1e1e30]">
                <p class="text-xs text-[#a0a0b0]">积分余额</p>
                <p class="text-lg font-bold text-[#7c6af5]">{{ credits.balance }}</p>
              </div>
              <router-link
                to="/console/history"
                class="flex items-center gap-2 px-3 py-2 text-sm text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#1e1e30] transition-colors"
                @click="userMenuOpen = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                历史记录
              </router-link>
              <router-link
                to="/console/settings"
                class="flex items-center gap-2 px-3 py-2 text-sm text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#1e1e30] transition-colors"
                @click="userMenuOpen = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </router-link>
              <div class="border-t border-[#1e1e30]">
                <button
                  @click="handleLogout"
                  class="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#f87171] hover:bg-[#1e1e30] transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Not Logged In -->
        <template v-else>
          <router-link
            to="/login"
            class="px-4 py-1.5 text-sm font-medium text-[#a0a0b0] hover:text-[#e0e0e0] transition-colors"
          >
            登录
          </router-link>
          <router-link
            to="/register"
            class="px-4 py-1.5 text-sm font-medium rounded-lg bg-[#7c6af5] text-white hover:bg-[#9d8cff] transition-colors"
          >
            注册
          </router-link>
        </template>
      </div>

      <!-- Mobile Hamburger -->
      <button
        @click="toggleMenu"
        class="md:hidden p-2 rounded-lg text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420] transition-colors"
        aria-label="切换菜单"
      >
        <svg v-if="!menuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="menuOpen"
      class="md:hidden border-t border-[#1e1e30] bg-[#0a0a0f]/98"
    >
      <nav class="px-4 py-3 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 text-sm font-medium rounded-lg"
          :class="isActive('/') ? 'text-[#7c6af5] bg-[#141420]' : 'text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420]'"
          @click="menuOpen = false"
        >
          首页
        </router-link>
        <router-link
          to="/pricing"
          class="block px-3 py-2 text-sm font-medium rounded-lg"
          :class="isActive('/pricing') ? 'text-[#7c6af5] bg-[#141420]' : 'text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420]'"
          @click="menuOpen = false"
        >
          定价
        </router-link>
        <router-link
          to="/docs"
          class="block px-3 py-2 text-sm font-medium rounded-lg"
          :class="isActive('/docs') ? 'text-[#7c6af5] bg-[#141420]' : 'text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420]'"
          @click="menuOpen = false"
        >
          文档
        </router-link>
      </nav>

      <div class="px-4 py-3 border-t border-[#1e1e30] space-y-2">
        <template v-if="auth.isLoggedIn">
          <div class="px-3 py-2 rounded-lg bg-[#141420] border border-[#1e1e30] mb-2">
            <p class="text-xs text-[#a0a0b0]">积分余额</p>
            <p class="text-lg font-bold text-[#7c6af5]">{{ credits.balance }}</p>
          </div>
          <router-link
            to="/console/history"
            class="flex items-center gap-2 px-3 py-2 text-sm text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420] rounded-lg transition-colors"
            @click="menuOpen = false"
          >
            历史记录
          </router-link>
          <router-link
            to="/console/settings"
            class="flex items-center gap-2 px-3 py-2 text-sm text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420] rounded-lg transition-colors"
            @click="menuOpen = false"
          >
            设置
          </router-link>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#f87171] hover:bg-[#141420] rounded-lg transition-colors"
          >
            退出登录
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="block px-3 py-2 text-sm font-medium text-[#a0a0b0] hover:text-[#e0e0e0] hover:bg-[#141420] rounded-lg transition-colors"
            @click="menuOpen = false"
          >
            登录
          </router-link>
          <router-link
            to="/register"
            class="block px-3 py-2 text-sm font-medium rounded-lg bg-[#7c6af5] text-white hover:bg-[#9d8cff] transition-colors text-center"
            @click="menuOpen = false"
          >
            注册
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>