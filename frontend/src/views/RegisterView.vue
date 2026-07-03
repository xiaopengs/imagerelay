<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary-50/50 to-gray-50">
    <div class="w-full max-w-md">
      <div class="card p-8 shadow-lg">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">创建账号</h1>
          <p class="text-gray-500 text-sm mt-1">注册即获得 10 积分免费体验</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- 邮箱 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              required
              class="input-field"
            />
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="设置密码（至少 6 位）"
                required
                minlength="6"
                class="input-field !pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
          </div>

          <!-- 确认密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
            <input
              v-model="form.confirm"
              :type="showPassword ? 'text' : 'password'"
              placeholder="再次输入密码"
              required
              class="input-field"
            />
          </div>

          <!-- 错误提示 -->
          <Transition name="fade">
            <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {{ error }}
            </div>
          </Transition>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ loading ? '注册中...' : '免费注册' }}
          </button>
        </form>

        <!-- 底部链接 -->
        <p class="text-center text-sm text-gray-500 mt-6">
          已有账号？<RouterLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">去登录</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
    error.value = e?.response?.data?.message || e?.response?.data?.error || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
