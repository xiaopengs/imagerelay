<template>
  <div class="min-h-screen bg-dark flex flex-col">
    <AppHeader />
    <main class="flex-1 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <h1 class="text-2xl font-bold text-center mb-8">创建账号</h1>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <!-- 邮箱 -->
            <div>
              <label class="block text-sm text-text-dim mb-2">邮箱</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                required
                class="w-full bg-card-light border border-white/10 rounded-lg px-4 py-2.5 text-text placeholder-text-dim focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <!-- 密码 -->
            <div>
              <label class="block text-sm text-text-dim mb-2">密码</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="设置密码"
                  required
                  minlength="6"
                  class="w-full bg-card-light border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-text placeholder-text-dim focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-text-dim mt-1.5">密码长度至少 6 位</p>
            </div>

            <!-- 确认密码 -->
            <div>
              <label class="block text-sm text-text-dim mb-2">确认密码</label>
              <input
                v-model="form.confirm"
                :type="showPassword ? 'text' : 'password'"
                placeholder="再次输入密码"
                required
                class="w-full bg-card-light border border-white/10 rounded-lg px-4 py-2.5 text-text placeholder-text-dim focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <!-- 错误提示 -->
            <div v-if="error" class="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {{ error }}
            </div>

            <!-- 提交按钮 -->
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ loading ? '创建中...' : '创建账号' }}
            </button>
          </form>

          <p class="text-center text-sm text-text-dim mt-6">
            已有账号？<RouterLink to="/login" class="text-primary hover:text-primary-light transition-colors">去登录</RouterLink>
          </p>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ email: '', password: '', confirm: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (form.value.password !== form.value.confirm) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.register(form.value.email, form.value.password)
    router.push('/console')
  } catch (e: any) {
    error.value = e?.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>